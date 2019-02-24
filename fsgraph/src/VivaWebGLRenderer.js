//@ts-check
import Viva from './viva-proxy';
import { GraphController } from './GraphController';
import { VivaWebGLSimpleBackend } from './VivaWebGLSimpleBackend';
import { VivaStateView } from './VivaStateView';
import { WebGLDnDManager, DnDHandler } from './VivaMod/webglInputManager';
import * as $ from 'jquery';
import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/keycode';
import 'jquery-ui/ui/widgets/selectable';
import 'jquery-ui/ui/widgets/button';
import 'jquery-ui/ui/widgets/tabs';
import 'jquery-ui/ui/widgets/accordion';
import 'jquery-ui/ui/widgets/dialog';
import * as Split from 'split.js';
import { Point2D } from './Point2D';
import { NodeUIBuilder } from './NodeUIBuilder';
import { getOrCreateTranslatorInstance } from './Misc/Translator';
import { VivaImageNodeUI } from './VivaImageNodeUI';

class RendererTransform {
    constructor(scale = 1, offsetX = 0, offsetY = 0, rot = 0) {
        this.scale = scale;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.rot = rot;
    }
}

/**
 * Вива-специфичен по причине завязки на их graphics backend api
 * (webglGraphics, ...)
 */
export class VivaWebGLRenderer {

    /**
     * 
     * @param {HTMLElement} baseContainer 
     * @param {*} backend 
     */
    constructor(baseContainer, backend = null) {
        this._container = this._buildUi(baseContainer);
        this._baseContainer = baseContainer;

        if (backend == null) {
            this._backend = new VivaWebGLSimpleBackend(new NodeUIBuilder(this));
        }
        this._graphics = this._backend.graphics;

        /** @type {Ngraph.Graph.Graph} */
        this._graphBackend = null;
        /** @type {Ngraph.Generic.Layout} */
        this._layoutBackend = null;
        /** @type {GraphController} */
        this._graphController = null;

        this._viewRules = null;

        this._listContainer = null;

        // #region Viva-resemble API compabilities

        //
        this._animationTimer = null;
        //
        this._isStable = false;
        //
        this._isManuallyPaused = false;
        //
        this._isInitialized = false;
        ///
        this._userInteraction = false;
        //
        this._updateCenterRequired = false;
        // HACK: пока к-т масштабирования зависит от dpi
        this._transform = new RendererTransform(this._graphics.getTransform()[10]);
        
        this._inputManager = null;

        this._defDnDHandler = null;
        //
        this._containerDrag = null;

        // #endregion
    }

    // #region Public API extensions

    get isStable() {
        return this._isStable;
    }

    get isReallyPaused() {
        // TODO:
        return this.isStable || this.isManuallyPaused;
    }

    get isManuallyPaused() {
        return this._isManuallyPaused;
    }

    get graphics() {
        return this._graphics;
    }

    get graphicsInputListner() {
        return this._backend.inputListner;
    }

    /**
     * @param {Ngraph.Graph.Graph} value
     */
    set graphBackend(value) {
        this._graphBackend = value;
        // TODO: обработка событий и всё такое
        this._inputManager = new WebGLDnDManager(this._graphics);
    }

    /**
     * @param {Ngraph.Generic.Layout} value
     */
    set layoutBackend(value) {
        this._layoutBackend = value;
        // TODO: обработка событий и всё такое?
    }

    /**
     * @param {VivaStateView} value
     */
    set viewRules(value) {
        if (this._viewRules != null) {
            throw new Error("Can not change view rule!");
        }
        this._viewRules = value;

        // Устанавливаем коллбэки из графики
        this._backend.onRenderNodeCallback = value.onNodeRender;
        this._backend.onRenderEdgeCallback = value.onEdgeRender;

        this._backend.nodeTypes = value.nodeTypes;

        // TODO: inverse dependency!
        this.graphicsInputListner.click((/** @type {VivaImageNodeUI} */nodeUI) => {
            value.onNodeClick(nodeUI, this._graphBackend, this);
        });

        this.graphicsInputListner.dblClick((/** @type {VivaImageNodeUI} */nodeUI) => {
            if (nodeUI) {
                this._layoutBackend.pinNode(nodeUI.node, !this._layoutBackend.isNodePinned(nodeUI.node));
            }
        });
    }

    /**
     * @param {GraphController} value
     */
    set graphController(value) {
        this._graphController = value;
        this.layoutBackend = value.layoutInstance;
        this.graphBackend = value.graph;

        this.currentStateId = 0;

        value.layoutBuilder.buildUI(this);
        this._buildTimeline();
        this._buildMetricsUI();
    }

    /**
     * @param {number} value
     */
    set angleDegrees(value) {
        this._graphics.rotate(value * Math.PI / 180)
        this.rerender();
    }

    onContainerResize() {
        this._graphics.updateSize();
        $('#scivi_fsgraph_tabs').resize();
        $("#scivi_fsgraph_tabs").tabs('refresh');
        $('#scivi_fsgraph_settings_accordion').accordion('refresh');
        this.rerender();
    }

    /**
     * 
     * @param {number[]} colors 
     * @param {string[] | undefined} nodeTypes 
     */
    buildDefaultView(colors, nodeTypes) {
        // TODO: check for graph group count
        let result = new VivaStateView(colors, nodeTypes || [], this);
        let metrics = this._graphController.metrics;
        let edgeMetrics = this._graphController.edgeMetrics;
        // TODO: move this shit out of here (in enherited from VStateView class)
        result.onNodeRender = (nodeUI) => {
            nodeUI.node['size'] = nodeUI.size = result.getNodeUISize(nodeUI.node.data.weight, metrics.maxWeight);
            nodeUI.color = result._colorPairs[(1 + nodeUI.node.data.groupId) * 2 + (nodeUI.selected ? 1 : 0)];
        };
        result.onEdgeRender = (edgeUI) => {
            edgeUI.link['size'] = edgeUI.size = result.getEdgeUISize(edgeUI.link.data.weight, edgeMetrics.maxWeight);
            edgeUI.color = result._colorPairs[(edgeUI.selected ? 1 : 0)];
        };
        result.onSettingsUpdate = this.rerender.bind(this);
        return result;
    }

    /**
     * @param {number} value
     */
    set currentStateId(value) {
        this._graphController.setCurrentStateIdEx(value, this);
        this.buildNodeListInfo();
    }

    kick() {
        if (!this._isManuallyPaused) {
            this._resetStable();
        }

        return this;
    }

    // #endregion

    // #region Viva-resemble API (fluent!)

    /**
     * 
     */
    run(prepareIterations = 0) {
        if (prepareIterations > 0) {
            this._initPrelayoutEnv(prepareIterations);
            return;
        }
        if (!this._isInitialized) {
            this._initDom();
            this._fitToScreen();
            this._isInitialized = true;
        }
        if (!this._animationTimer) {
            // TODO: WTF откуда пилять тут берётся второй аргумент, если никто его потом не обрабатывает?
            // (См. исходники timer)
            this._animationTimer = Viva.Graph.Utils.timer(() => this._onRenderFrame());//, this._frameTicks);
        }
        return this;
    }

    reset() {
        throw new Error("Not implemented!");
    }

    pause() {
        if (this._animationTimer) {
            this._animationTimer.stop();
            this._isManuallyPaused = true;
        }
        return this;
    }

    resume() {
        this._resetStable();
        this._isManuallyPaused = false;
        return this;
    }

    rerender() {
        if (this.isReallyPaused) {
            this._renderGraph();
        } else {
            this._resetStable();
        }
        return this;
    }

    zoomOut() {
        throw new Error("Not implemented!");
    }

    zoomIn() {
        throw new Error("Not implemented!");
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    moveTo(x, y) {
        throw new Error("Not implemented!");
    }

    getGraphics() {
        throw new Error("Not implemented!");
    }

    dispose() {
        throw new Error("Not implemented!");
    }

    /**
     * 
     * @param {string} eventName 
     * @param {function} callback 
     */
    on(eventName, callback) {
        throw new Error("Not implemented!");
    }

    /**
     * 
     * @param {string} eventName 
     * @param {function} callback 
     */
    off(eventName, callback) {
        throw new Error("Not implemented!");
    }

    // #endregion

    // #region Private stuff

    /**
     * 
     * @param {number} iterations 
     */
    _initPrelayoutEnv(iterations) {
        const itersPerStep = 250;
        const progressLabel = document.createElement('span');
        let forceStop = false;
        progressLabel.innerText = '0';
        const dialog = $(`<div title="Precalculating layout">
        <span>out of ${iterations}</span></div>`);
        dialog.css('vertical-align', 'center').css('text-align', 'center');
        /**
         * 
         * @param {boolean} enableLayout 
         */
        const onDialogClose = (enableLayout) => {
            forceStop = true;
            dialog.dialog('close');
            this.run(0);
            if (!enableLayout) {
                this.pause()._updateUI();
            }
        };
        dialog.prepend(progressLabel);
        dialog.dialog({
            modal: true,
            buttons: {
                'Cancel': () => onDialogClose(true)
            }
        })
        /**
         * 
         * @param {number} it 
         * @param {number} remaing 
         */
        const onStep = (it, remaing) => {
            setTimeout(() => {
                if (forceStop) {
                    return;
                }
                progressLabel.innerText = it.toString();
                if (remaing <= 0) {
                    onDialogClose(false);
                    return;
                }
                let totalCount = Math.min(itersPerStep, remaing);
                for (let i = 0; i < totalCount; i++) {
                    this._layoutBackend.step();
                }
                onStep(it + totalCount, remaing - totalCount);
            }, 30)
        };
        onStep(0, iterations);
    }

    _renderGraph() {
        this._graphics.beginRender();
        this._graphics.renderLinks();
        this._graphics.renderNodes();
        this._graphics.endRender();
    }

    _onRenderFrame() {
        this._isStable = this._layoutBackend.step() && !this._userInteraction;
        this._renderGraph();

        return !this._isStable;
    }
    
    _resetStable() {
        this._isStable = false;
        if (this._animationTimer) {
            this._animationTimer.restart();
        }
    }

    /**
     * @param {Ngraph.Graph.Node} node 
     */
    _listenNodeEvents(node) {
        // TODO: выбросить проверку, создавать обработчики один раз!
        if (!this._defDnDHandler) {
            this._buildDefaultDnDHandler();
            if (!this._defDnDHandler) {
                throw new Error('Somethin wens wrong with default drag\'n\'drop handler');
            }
        }
        this._inputManager.bindDragNDrop(node, this._defDnDHandler);
    }

    /**
     * @param {Ngraph.Graph.Node} node 
     */
    _releaseNodeEvents(node) {
        this._inputManager.unbindDragNDrop(node);
    }

    /**
     * 
     * @param {Ngraph.Generic.GraphChange} change 
     * @returns {void}
     */
    _processNodeChange(change) {
        let node = (/** @type {Ngraph.Graph.Node} */(change.node));
        if (change.changeType === 'add') {
            this._createNodeUi(node);
            this._listenNodeEvents(node);
        } else if (change.changeType === 'remove') {
            this._releaseNodeEvents(node);
            this._removeNodeUi(node);
        } else if (change.changeType === 'update') {
            this._releaseNodeEvents(node);
            this._removeNodeUi(node);

            this._createNodeUi(node);
            this._listenNodeEvents(node);
        }
    }

    /**
     * 
     * @param {Ngraph.Generic.GraphChange} change 
     * @returns {void}
     */
    _processLinkChange(change) {
        let link = (/** @type {Ngraph.Graph.Link} */(change.link));
        if (change.changeType === 'add') {
            this._createLinkUi(link);
        } else if (change.changeType === 'remove') {
            this._removeLinkUi(link);
        } else if (change.changeType === 'update') {
            throw 'Update type is not implemented. TODO: Implement me!';
        }
    }

    /**
     * 
     * @param {Ngraph.Generic.GraphChange[]} changes 
     * @returns {void}
     */
    _onGraphChanged(changes) {
        let i, change;
        for (i = 0; i < changes.length; i += 1) {
            change = changes[i];
            if (change.node) {
                this._processNodeChange(change);
            } else if (change.link) {
                this._processLinkChange(change);
            }
        }

        this.kick();
    }

    /**
     * 
     * @param {Ngraph.Generic.Rect} graphRect 
     * @param {{width:number, height:number}} containerSize 
     */
    _updateCenterReal(graphRect, containerSize) {
        const cx = (graphRect.x2 + graphRect.x1) / 2;
        const cy = (graphRect.y2 + graphRect.y1) / 2;
        this._transform.offsetX = containerSize.width / 2 - (cx * this._transform.scale / 2);
        this._transform.offsetY = containerSize.height / 2 - (cy * this._transform.scale / 2);
        this._graphics.graphCenterChanged(this._transform.offsetX, this._transform.offsetY);

        this._updateCenterRequired = false;
    }

    /**
     * 
     * @param {Ngraph.Generic.Rect} graphRect 
     * @param {{width:number, height:number}} containerSize 
     */
    _scaleToScreen(graphRect, containerSize) {
        const oldScale = this._transform.scale;
        const someAccidentPadding = 100;

        const graphWidth = (graphRect.x2 - graphRect.x1) + someAccidentPadding;
        const graphHeight = (graphRect.y2 - graphRect.y1) + someAccidentPadding;

        const scaleRatio = 1 / Math.max(graphWidth / containerSize.width, graphHeight / containerSize.height);

        this._transform.scale = this._graphics.scale(scaleRatio / oldScale * 2, new Point2D(this._transform.offsetX, this._transform.offsetY));
    }

    _updateCenter() {
        const graphRect = this._layoutBackend.getGraphRect();
        const containerSize = Viva.Graph.Utils.getDimension(this._container);

        this._updateCenterReal(graphRect, containerSize);
    }

    _fitToScreen() {
        const graphRect = this._layoutBackend.getGraphRect();
        const containerSize = Viva.Graph.Utils.getDimension(this._container);

        this._updateCenterReal(graphRect, containerSize);
        this._scaleToScreen(graphRect, containerSize);
    }

    _initDom() {
        this._backend.postInit(this._container);

        this._graphBackend.forEachNode((node) => {
            this._createNodeUi(node);
            return false;
        });

        this._graphBackend.forEachLink((link) => {
            this._createLinkUi(link);
            return false;
        });

        // listen to events
        window.addEventListener('resize', () => this.onContainerResize());

        this._containerDrag = Viva.Graph.Utils.dragndrop(this._container);
        this._containerDrag.onDrag((e, offset) => {
            this._graphics.translateRel(offset.x, offset.y);
            this._renderGraph();
            //publicEvents.fire('drag', offset);
        });
    
        this._containerDrag.onScroll((e, scaleOffset, scrollPoint) => {
            this._scale(scaleOffset < 0, scrollPoint);
        });
    
        this._graphBackend.forEachNode((node) => {
            this._listenNodeEvents(node);
            return false;
        });
    
        this._graphBackend.on('changed', (changes) => this._onGraphChanged(changes));
    }

    /**
     * 
     * @param {Ngraph.Graph.Node} node 
     */
    _createNodeUi(node) {
        var nodePosition = this._layoutBackend.getNodePosition(node.id);
        this._graphics.addNode(node, nodePosition);
    }

    /**
     * 
     * @param {Ngraph.Graph.Node} node 
     */
    _removeNodeUi(node) {
        this._graphics.releaseNode(node);
    }
    
    /**
     * 
     * @param {Ngraph.Graph.Link} link 
     */
    _createLinkUi(link) {
        let linkPosition = this._layoutBackend.getLinkPosition(link.id);
        this._graphics.addLink(link, linkPosition);
    }
    
    /**
     * 
     * @param {Ngraph.Graph.Link} link 
     */
    _removeLinkUi(link) {
        this._graphics.releaseLink(link);
    }

    /**
     * 
     * @param {boolean} out 
     * @param {Ngraph.Graph.Position} scrollPoint 
     * @returns {number}
     */
    _scale(out, scrollPoint) {
        if (!scrollPoint) {
            const containerSize = Viva.Graph.Utils.getDimension(this._container);
            scrollPoint = {
                x: containerSize.width / 2,
                y: containerSize.height / 2
            };
        }
        const scaleFactor = Math.pow(1 + 0.4, out ? -0.2 : 0.2);
        this._transform.scale = this._graphics.scale(scaleFactor, scrollPoint);
    
        this._renderGraph();
        // publicEvents.fire('scale', transform.scale);
    
        return this._transform.scale;
      }

    // #endregion

    _buildDefaultDnDHandler() {
        let wasPinned = false
        this._defDnDHandler = new DnDHandler((e, pos, node) => {
                wasPinned = this._layoutBackend.isNodePinned(node);
                this._layoutBackend.pinNode(node, true);
                this._userInteraction = true;
                this.kick();
            },
            (e, offset, node) => {
                let oldPos = this._layoutBackend.getNodePosition(node.id);
                let transform = this._graphics.getTransform();
                // TODO: move matrix op-s into separate module, get rid of duplicated code
                let newOffset = [(offset.x * transform[0] + offset.y * transform[4]), (offset.x * transform[1] + offset.y * transform[5])];

                // TODO: drop such a kostyl'
                const dpi = this._graphics.pixelRatio();
                const scaleCoef = this._transform.scale * this._transform.scale;// * dpi;

                this._layoutBackend.setNodePosition(node.id,
                    oldPos.x + newOffset[0] * 2 / scaleCoef,
                    oldPos.y + newOffset[1] * 2 / scaleCoef);

                this._userInteraction = true;
                this._renderGraph();
            },
            (node) => {
                this._layoutBackend.pinNode(node, wasPinned);
                this._userInteraction = false;
            });
    }

    /**
     * 
     * @param {HTMLElement} baseContainer 
     */
    _buildUi(baseContainer) {
        const tr = getOrCreateTranslatorInstance();
        const that = this;
        baseContainer.innerHTML = `
        <div id="scivi_fsgraph_a" class="split split-horizontal">
            <div id="scivi_fsgraph_rotate_bar_container">
                <div id="scivi_fsgraph_rotate_bar">
                    <div id="rotate_bar_handle" class="ui-slider-handle"></div>
                </div>
            </div>
            <div id="scivi_fsgraph_view"></div>
        </div>
        <div id="scivi_fsgraph_b" class="split split-horizontal">
            <div id="scivi_fsgraph_tabs">
                <ul>
                    <li><a id="scivi_fsgraph_lnk_control" href="#scivi_fsgraph_control">${tr.apply('#control')}</a></li>
                    <li><a id="scivi_fsgraph_lnk_info" href="#scivi_fsgraph_info">${tr.apply('#node_info')}</a></li>
                    <li><a id="scivi_fsgraph_lnk_list" href="#scivi_fsgraph_list">${tr.apply('#node_list')}</a></li>
                    <li><a id="scivi_fsgraph_lnk_settings" href="#scivi_fsgraph_settings">${tr.apply('#settings')}</a></li>
                    <li><a id="scivi_fsgraph_lnk_stats" href="#scivi_fsgraph_stats">${tr.apply('#stats')}</a></li>
                </ul>
                <div id="scivi_fsgraph_control"></div>
                <div id="scivi_fsgraph_info"></div>
                <div id="scivi_fsgraph_list"></div>
                <div id="scivi_fsgraph_settings">
                    <div id="scivi_fsgraph_settings_accordion">
                        <h3>${tr.apply('#appearance')}</h3>
                        <div id="scivi_fsgraph_settings_appearance"></div>
                        <h3>${tr.apply('#layout')}</h3>
                        <div id="scivi_fsgraph_settings_layout"></div>
                    </div>
                </div>
                <div id="scivi_fsgraph_stats"></div>
            </div>
        </div>`;

        Split(['#scivi_fsgraph_a', '#scivi_fsgraph_b'], {
            gutterSize: 8,
            cursor: 'col-resize',
            sizes: [75, 25],
            onDrag: () =>  that.onContainerResize()
        });

        $("#scivi_fsgraph_tabs").tabs({
            heightStyle: "fill"
        });
    
        const customHandle = $('#rotate_bar_handle');
        /**
         * 
         * @param {number} value 
         */
        const setHandleText = (value) => {
            customHandle.text(`${value}°`);
        };
        $("#scivi_fsgraph_rotate_bar").slider({
            min: -180,
            max: 180,
            value: 0,
            step: 5,
            slide: (event, ui) => {
                const value = ui.value || 0
                that.angleDegrees = value;
                setHandleText(value);
            },
            create: () => setHandleText(0)
        });

        $('#scivi_fsgraph_settings_accordion').accordion({
            heightStyle: 'content',
            collapsible: true
        });

        // добавляем кнопку старт/стоп и "fit to screen" здесь
        const controlElement = $('#scivi_fsgraph_control');

        const startStopButton = document.createElement('button');
        startStopButton.id = 'scivi_fsgraph_startstop_button';
        // HACK: Ни дня без веселья! Оказывается, описание типов не соответствует реализации:
        // первое говорит, что в настройках конпки есть "click" callback, а в реализации такого нет!
        // Ну и сущий пустяк: реализация позволяет указать "create" callback, а в типах про него пусто!
        // кто и как этим пользуется - загадка
        $(startStopButton).button({
            label: tr.apply('#pause_resume')
        });
        $(startStopButton).click((ev) => {
            if (that.isManuallyPaused) {
                that.resume();
            } else {
                that.pause();
            }
            that._updateUI();
        });
        controlElement.append(startStopButton);

        const fitToScreenButton = document.createElement('button');
        $(fitToScreenButton).button({
            label: tr.apply('#fit_to_screen')
        });
        // $(fitToScreenButton).button('option', 'icon', 'ui-icon-arrow-4-diag')
        $(fitToScreenButton).click((ev) => {
            that._fitToScreen();
            that.rerender();
        });
        controlElement.append(fitToScreenButton);

        this._updateUI();

        return $('#scivi_fsgraph_view')[0];
    }

    _buildTimeline() {
        const statesCount = this._graphController.states.length;
        if (statesCount == 1) {
            return;
        }

        const tlContainer = document.createElement('div');
        const innerTlContainer = document.createElement('div');
        const timeline = document.createElement('div');
        timeline.id = 'scivi_fsgraph_stateline';
        tlContainer.id = 'scivi_fsgraph_stateline_container';
        innerTlContainer.id = 'scivi_fsgraph_stateline_inner';
        innerTlContainer.appendChild(timeline);
        tlContainer.appendChild(innerTlContainer);
        $('#scivi_fsgraph_a').append(tlContainer);

        const that = this;
        $(timeline).slider({
            min: 0,
            max: statesCount - 1,
            value: 0,
            step: 1,
            slide: (event, ui) => {
                that.currentStateId = ui.value || 0;
                that.rerender();
            }
        });

        const labelContainer = document.createElement('div');
        labelContainer.id = 'scivi_fsgraph_stateline_labels';
        
        const defWidth = 100.0 / statesCount;
        const defWidthStr = `${defWidth}%`;
        innerTlContainer.style.marginLeft = innerTlContainer.style.marginRight = `${(defWidth / 2)}%`;
        for (let i = 0; i < statesCount; i++) {
            const label = document.createElement('div');
            label.classList.add('scivi_fsgraph_stateline_label');
            label.innerHTML = `<span>|</span><br /><label>${this._graphController.states[i].label}</label>`;
            label.style.width = defWidthStr;
            labelContainer.appendChild(label);
        }
        tlContainer.appendChild(labelContainer);
    }

    _buildMetricsUI() {
        const metrics = this._graphController.graphMetrics;
        if (!metrics.length) {
            return;
        }
        const tr = getOrCreateTranslatorInstance();
        
        const root = $('#scivi_fsgraph_stats');
        root.empty();

        for (const metric of metrics) {
            const metricDiv = document.createElement('div');
            metricDiv.className = 'scivi_fsgraph_metric_control';
            metricDiv.innerHTML = `<span>${tr.apply(metric.id())}</span><br>`;
            const label = document.createElement('div');
            label.className = 'centered';
            const btn = $(document.createElement('button')).button();
            btn.button('option', 'icon', 'ui-icon-play');
            btn.click((evt) => {
                btn.button("option", "disabled", true).promise().then(_ => {
                    metric.execute().then(result => {
                        btn.button("option", "disabled", false);
                        btn.button("option", "label", result.toFixed(3));
                    });
                });
            });

            $(label).append(btn);
            $(metricDiv).append(label);
            root.append(metricDiv);
        }
    }

    buildNodeListInfo() {
        if (!this._listContainer) {
            this._listContainer = document.createElement('div');
            $('#scivi_fsgraph_list')[0].appendChild(this._listContainer);
        }

        this._listContainer.innerHTML = '';
        let cs = this._graphController.currentState;

        const tr = getOrCreateTranslatorInstance();
        // hint
        const hint = document.createElement('span');
        hint.innerText = tr.apply('#node_list_hint');
        this._listContainer.appendChild(hint);
        this._listContainer.appendChild(document.createElement('br'));

        // кнопки "скрыт/показать всё"
        let showAllButton = document.createElement('button');
        showAllButton.textContent = tr.apply('#show_non_filtered');
        showAllButton.onclick = (ev) => {
            cs.pseudoActualize();
            this.rerender();
        };
        this._listContainer.appendChild(showAllButton);

        let hideAllButton = document.createElement('button');
        hideAllButton.textContent = tr.apply('#hide_all_nodes');
        hideAllButton.onclick = (ev) => {
            cs.pseudoDisable();
            this.rerender();
        };
        this._listContainer.appendChild(hideAllButton);

        const listItself = document.createElement('ul');
        listItself.classList.add('pseudo-list');

        cs.forEachNode((node) => {
            listItself.appendChild(node.postListItem(this));
        });

        this._listContainer.appendChild(listItself);
    }

    _updateUI() {
        // TODO: completle rewrite this
        if (this.isManuallyPaused) {
            $('#scivi_fsgraph_startstop_button').button('option', 'icon', 'ui-icon-play');
        } else {
            $('#scivi_fsgraph_startstop_button').button('option', 'icon', 'ui-icon-pause');
        }
    }

    /**
     * 
     * @param {Ngraph.Graph.Position} pos in graph space
     */
    centerAtGraphPoint(pos) {
        const containerSize = Viva.Graph.Utils.getDimension(this._container);
        this._graphics.graphCenterChanged(0, 0);
        let pos2 = new Point2D(pos.x, pos.y);
        this._graphics.transformGraphToClientCoordinates(pos2);
        this._transform.offsetX = containerSize.width / 2 - pos2.x;
        this._transform.offsetY = containerSize.height / 2 - pos2.y;
        this._graphics.graphCenterChanged(this._transform.offsetX, this._transform.offsetY);

        this.kick();
    }
}
