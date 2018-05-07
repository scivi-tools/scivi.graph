//@ts-check
import Viva from './viva-proxy'
import { GraphController } from './GraphController'
import { VivaWebGLSimpleBackend } from './VivaWebGLSimpleBackend'
import { VivaStateView } from './VivaStateView'
import { WebGLDnDManager, DnDHandler } from './VivaMod/webglInputManager'
import $ from 'jquery'
import 'jquery-ui/ui/core'
import 'jquery-ui/ui/widgets/selectable'
import 'jquery-ui/ui/widgets/button'

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

    constructor(container, backend = null) {
        this._container = container;

        if (backend == null) {
            this._backend = new VivaWebGLSimpleBackend();
        }
        this._graphics = this._backend.graphics;

        this._renderer = null;

        this._graphBackend = null;
        this._layoutBackend = null;
        this._graphController = null;

        this._viewRules = null;

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
        /* @type {webglInputManager} */
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

    set graphBackend(value) {
        this._graphBackend = value;
        // TODO: обработка событий и всё такое
        this._inputManager = new WebGLDnDManager(value, this._graphics);
    }

    set layoutBackend(value) {
        /** @type {NgGenericLayout} */
        this._layoutBackend = value;
        // TODO: обработка событий и всё такое?
    }

    /**
     * @param {VivaStateView} value
     */
    set viewRules(value) {
        this._viewRules = value;

        // Устанавливаем коллбэки из графики
        this._backend.onRenderNodeCallback = value.onNodeRender;
        this._backend.onRenderEdgeCallback = value.onEdgeRender;
    }

    /**
     * @param {GraphController} value
     */
    set graphController(value) {
        this._graphController = value;
        this.layoutBackend = value.layoutInstance;
        // TODO: добавить нормальный геттер
        this.graphBackend = value._graph;

        value.layoutBuilder.buildUI(this);
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
            nodeUI.showLabel = nodeUI.node.data.groupId === 0;
            nodeUI.size = result.getNodeUISize(nodeUI.node.data.weight, metrics.maxWeight);
            nodeUI.color = result._colorPairs[(1 + nodeUI.node.data.groupId) * 2 + 1/*(nodeUI.selected)*/];
        };
        result.onEdgeRender = (edgeUI) => {
            // TODO: no such property "selected"!
            edgeUI.color = result._colorPairs[0/*edgeUI.selected*/];
        };
        // TODO: inverse dependency!
        this.graphicsInputListner.click((nodeUI) => {
            result.onNodeClick(nodeUI, this._graphBackend);
        });
        return result;
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
        this._buildUi();

        this._backend.postInit(this._container);

        this._graphBackend.forEachNode((node) => this._createNodeUi(node));

        this._graphBackend.forEachLink((link) => this._createLinkUi(link));

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
    
        this._graphBackend.forEachNode((node) => this._listenNodeEvents(node));
    
        this._graphBackend.on('changed', (changes) => this._onGraphChanged(changes));
    }

    _createNodeUi(node) {
        var nodePosition = this._layoutBackend.getNodePosition(node.id);
        this._graphics.addNode(node, nodePosition);
    }

    _removeNodeUi(node) {
        this._graphics.releaseNode(node);
    }
    
    _createLinkUi(link) {
        let linkPosition = this._layoutBackend.getLinkPosition(link.id);
        this._graphics.addLink(link, linkPosition);
    }
    
    _removeLinkUi(link) {
        this._graphics.releaseLink(link);
    }

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

    _buildUi() {
        // TODO: добавляем кнопку старт/стоп и вращение здесь!
        const controlElement = $('#control')[0];
        let startStopButton = document.createElement('div');
        const that = this;

        const changeIcon = (name) => {
            $(startStopButton).button('option', 'icon', name);
        };

        $(startStopButton).button({
            label: "Pause/Resume layout",
            click: (ev) => {
                if (that.isManuallyPaused) {
                    that.resume();
                    changeIcon('ui-icon-pause');
                } else {
                    that.pause();
                    changeIcon('ui-icon-play');
                }
            }
        });
        changeIcon('ui-icon-pause');

        controlElement.appendChild(startStopButton);
    }
}
