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
import Split from 'split.js';
import { Point2D } from './Point2D';
import { NodeUIBuilder } from './NodeUIBuilder';

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

        this._renderer = null;

        /** @type {NgraphGraph.Graph} */
        this._graphBackend = null;
        /** @type {NgraphGeneric.Layout} */
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
        //
        this._transform = new RendererTransform();
        /** @type {WebGLDnDManager} */
        this._inputManager = null;
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
     * @param {NgraphGraph.Graph} value
     */
    set graphBackend(value) {
        this._graphBackend = value;
        // TODO: обработка событий и всё такое
        this._inputManager = new WebGLDnDManager(value, this._graphics);
    }

    /**
     * @param {NgraphGeneric.Layout} value
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

        // TODO: inverse dependency!
        this.graphicsInputListner.click((nodeUI) => {
            value.onNodeClick(nodeUI, this._graphBackend, this);
        });

        this.graphicsInputListner.dblClick((nodeUI) => {
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
        this.rerender();
    }

    buildDefaultView(colors, imgs) {
        // TODO: check for graph group count
        let result = new VivaStateView(colors, imgs, this);
        let metrics = this._graphController.metrics;
        // TODO: move this shit out of here (in enherited from VStateView class)
        result.onNodeRender = (nodeUI) => {
            nodeUI.node['size'] = nodeUI.size = result.getNodeUISize(nodeUI.node.data.weight, metrics.maxWeight);
            nodeUI.color = result._colorPairs[(1 + nodeUI.node.data.groupId) * 2 + (nodeUI.selected ? 1 : 0)];
        };
        result.onEdgeRender = (edgeUI) => {
            edgeUI.color = result._colorPairs[(edgeUI.selected ? 1 : 0)];
        };
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
            /*setTimeout(() => {
                const step = 250;
                for (let i = 0; i < Math.min(step, prepareIterations); i++) {
                    this._layoutBackend.step();
                }
                this.run(prepareIterations - step);
            }, 30);
            return;*/
        }
        if (!this._isInitialized) {
            this._initDom();
            this._updateCenter();
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
        this._animationTimer.stop();
        this._isManuallyPaused = true;
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

    moveTo (x, y) {
        throw new Error("Not implemented!");
    }

    getGraphics() {
        throw new Error("Not implemented!");
    }

    dispose() {
        throw new Error("Not implemented!");
    }

    on(eventName, callback) {
        throw new Error("Not implemented!");
    }

    off(eventName, callback) {
        throw new Error("Not implemented!");
    }

    // #endregion

    // #region Private stuff

    get _frameTicks() {
        return 30;
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
        this._animationTimer.restart();
    }

    _listenNodeEvents(node) {
        // TODO: выбросить проверку, создавать обработчики один раз!
        if (!this._defDnDHandler) {
            this._buildDefaultDnDHandler();
        }
        this._inputManager.bindDragNDrop(node, this._defDnDHandler);
    }

    _releaseNodeEvents(node) {
        this._inputManager.unbindDragNDrop(node);
    }

    _processNodeChange(change) {
        /** @type {NgraphGraph.Node} */
        let node = change.node;

        if (change.changeType === 'add') {
            this._createNodeUi(node);
            this._listenNodeEvents(node);
            if (this._updateCenterRequired) {
                this._updateCenter();
            }
        } else if (change.changeType === 'remove') {
            this._releaseNodeEvents(node);
            this._removeNodeUi(node);
            if (this._graphBackend.getNodesCount() === 0) {
                this._updateCenterRequired = true; // Next time when node is added - center the graph.
            }
        } else if (change.changeType === 'update') {
            this._releaseNodeEvents(node);
            this._removeNodeUi(node);

            this._createNodeUi(node);
            this._listenNodeEvents(node);
        }
    }

    _processLinkChange(change) {
        let link = change.link;
        if (change.changeType === 'add') {
            this._createLinkUi(link);
        } else if (change.changeType === 'remove') {
            this._removeLinkUi(link);
        } else if (change.changeType === 'update') {
            throw 'Update type is not implemented. TODO: Implement me!';
        }
    }

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

    _updateCenter() {
        var graphRect = this._layoutBackend.getGraphRect(),
            containerSize = Viva.Graph.Utils.getDimension(this._container);

        var cx = (graphRect.x2 + graphRect.x1) / 2;
        var cy = (graphRect.y2 + graphRect.y1) / 2;
        this._transform.offsetX = containerSize.width / 2 - (cx * this._transform.scale - cx);
        this._transform.offsetY = containerSize.height / 2 - (cy * this._transform.scale - cy);
        this._graphics.graphCenterChanged(this._transform.offsetX, this._transform.offsetY);

        this._updateCenterRequired = false;
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
     * @param {NgraphGraph.Node} node 
     */
    _createNodeUi(node) {
        var nodePosition = this._layoutBackend.getNodePosition(node.id);
        this._graphics.addNode(node, nodePosition);
    }

    /**
     * 
     * @param {NgraphGraph.Node} node 
     */
    _removeNodeUi(node) {
        this._graphics.releaseNode(node);
    }
    
    /**
     * 
     * @param {NgraphGraph.Link} link 
     */
    _createLinkUi(link) {
        let linkPosition = this._layoutBackend.getLinkPosition(link.id);
        this._graphics.addLink(link, linkPosition);
    }
    
    /**
     * 
     * @param {NgraphGraph.Link} link 
     */
    _removeLinkUi(link) {
        this._graphics.releaseLink(link);
    }

    /**
     * 
     * @param {boolean} out 
     * @param {NgraphGraph.Position} scrollPoint 
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
                this._layoutBackend.setNodePosition(node.id,
                    oldPos.x + newOffset[0] * 2 / this._transform.scale / this._transform.scale,
                    oldPos.y + newOffset[1] * 2 / this._transform.scale / this._transform.scale);

                this._userInteraction = true;
                this._renderGraph();
            },
            (node) => {
                this._layoutBackend.pinNode(node, wasPinned);
                this._userInteraction = false;
            });
    }

    _buildUi(/** @type {HTMLElement} */baseContainer) {
        const that = this;
        baseContainer.innerHTML = `
        <div id="scivi_fsgraph_a" class="split split-horizontal">
            <div id="scivi_fsgraph_rotate_bar_container">
                <div id="scivi_fsgraph_rotate_bar"></div>
            </div>
            <div id="scivi_fsgraph_view"></div>
        </div>
        <div id="scivi_fsgraph_b" class="split split-horizontal">
            <div id="scivi_fsgraph_tabs">
                <ul>
                    <li><a id="scivi_fsgraph_lnk_control" href="#scivi_fsgraph_control">Управление</a></li>
                    <li><a id="scivi_fsgraph_lnk_info" href="#scivi_fsgraph_info">Информация</a></li>
                    <li><a id="scivi_fsgraph_lnk_list" href="#scivi_fsgraph_list">Вершины</a></li>
                    <li><a id="scivi_fsgraph_lnk_settings" href="#scivi_fsgraph_settings">Настройки</a></li>
                    <li><a id="scivi_fsgraph_lnk_stats" href="#scivi_fsgraph_stats">Статистика</a></li>
                </ul>
                <div id="scivi_fsgraph_control"></div>
                <div id="scivi_fsgraph_info"></div>
                <div id="scivi_fsgraph_list"></div>
                <div id="scivi_fsgraph_settings"></div>
                <div id="scivi_fsgraph_stats"></div>
            </div>
        </div>`;

        Split(['#scivi_fsgraph_a', '#scivi_fsgraph_b'], {
            gutterSize: 8,
            cursor: 'col-resize',
            sizes: [75, 25],
            onDrag: () => that.onContainerResize()
        });

       $("#scivi_fsgraph_tabs").tabs({
            heightStyle: "fill"
        });
    
        $("#scivi_fsgraph_rotate_bar").slider({
            min: -179,
            max: 179,
            value: 0,
            step: 1,
            slide: (event, ui) => {
                that.angleDegrees = ui.value;
            }
        });

        // TODO: добавляем кнопку старт/стоп и вращение здесь!
        const controlElement = $('#scivi_fsgraph_control')[0];
        let startStopButton = document.createElement('button');

        const changeIcon = (name) => {
            $(startStopButton).button('option', 'icon', name);
        };

        // HACK: Ни дня без веселья! Оказывается, описание типов не соответствует реализации:
        // первое говорит, что в настройках конпки есть "click" callback, а в реализации такого нет!
        // Ну и сущий пустяк: реализация позволяет указать "create" callback, а в типах про него пусто!
        // кто и как этим пользуется - загадка
        $(startStopButton).button({
            label: "Pause/Resume layout"
        });
        $(startStopButton).click((ev) => {
            if (that.isManuallyPaused) {
                that.resume();
                changeIcon('ui-icon-pause');
            } else {
                that.pause();
                changeIcon('ui-icon-play');
            }
        });
        changeIcon('ui-icon-pause');

        controlElement.appendChild(startStopButton);

        return $('#scivi_fsgraph_view')[0];
    }

    _buildTimeline() {
        let statesCount = this._graphController.states.length;
        if (statesCount == 1) {
            return;
        }

        let tlContainer = document.createElement('div');
        let timeline = document.createElement('div');
        timeline.id = 'scivi_fsgraph_stateline';
        tlContainer.id = 'scivi_fsgraph_stateline_container';
        tlContainer.appendChild(timeline);
        $('#scivi_fsgraph_a').append(tlContainer);

        const that = this;
        $(timeline).slider({
            min: 0,
            max: statesCount - 1,
            value: 0,
            step: 1,
            slide: (event, ui) => {
                that.currentStateId = ui.value;
                that.rerender();
            }
        });
    }

    buildNodeListInfo() {
        if (!this._listContainer) {
            this._listContainer = document.createElement('div');
            $('#scivi_fsgraph_list')[0].appendChild(this._listContainer);
        }

        this._listContainer.innerHTML = '';
        let cs = this._graphController.currentState;

        // кнопки "скрыт/показать всё"
        let showAllButton = document.createElement('button');
        showAllButton.textContent = 'Show all non-filtered';
        showAllButton.onclick = (ev) => {
            cs.pseudoActualize();
            this.rerender();
        };
        this._listContainer.appendChild(showAllButton);

        let hideAllButton = document.createElement('button');
        hideAllButton.textContent = 'Hide all';
        hideAllButton.onclick = (ev) => {
            cs.pseudoDisable();
            this.rerender();
        };
        this._listContainer.appendChild(hideAllButton);

        cs.forEachNode((node) => {
            this._listContainer.appendChild(node.postListItem(this));
        });
    }

    /**
     * 
     * @param {Point2D} pos in graph space
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
