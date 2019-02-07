/**
 * @author Andrei Kashcha (aka anvaka) / https://github.com/anvaka
 * @author Me
 */

import { webglInputEvents } from './webglInputEvents';
import { Point2D } from '../Point2D';
import { VivaImageNodeUI } from '../VivaImageNodeUI';

/**
 * D'n'D - drag'n'drop
 */
export class WebGLDnDManager {
    /**
     * 
     * @param {*} graphics 
     */
    constructor(graphics) {
        /** @type {Object.<string, DnDHandler>} */
        this.internalHandlers = {};

        /** @type {VivaGeneric.WebGlInputEvents<VivaImageNodeUI>} */
        this.inputEvents = webglInputEvents(graphics);
        /** @type {Ngraph.Graph.Node | null} */
        this.draggedNode = null;
        this.pos = new Point2D(0, 0);
        this.pos2 = new Point2D(0, 0);

        this.inputEvents.mouseDown((node, e) => this.onMouseDown(node, e))
            .mouseUp(node => this.onMouseUp(node))
            .mouseMove((node, e) => this.onMouseMove(node, e));
    }

    /**
     * 
     * @param {VivaImageNodeUI} node 
     * @param {MouseEvent} e 
     */
    onMouseDown(node, e) {
        this.draggedNode = node.node;
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;

        // @ts-ignore
        this.inputEvents.mouseCapture(this.draggedNode);

        var handlers = this.internalHandlers[node.id];
        if (handlers) {
            handlers.onStart(e, this.pos, node.node);
        }

        return true;
    }

    /**
     * 
     * @param {VivaImageNodeUI} node 
     */
    onMouseUp(node) {
        // @ts-ignore
        this.inputEvents.releaseMouseCapture(this.draggedNode);

        this.draggedNode = null;
        var handlers = this.internalHandlers[node.id];
        if (handlers) {
            handlers.onStop(node.node);
        }
        return true;
    }

    /**
     * 
     * @param {VivaImageNodeUI} node 
     * @param {MouseEvent} e
     * @returns {boolean}
     */
    onMouseMove(node, e) {
        if (this.draggedNode) {
            var handlers = this.internalHandlers[this.draggedNode.id];
            if (handlers) {
                this.pos2.x = e.clientX - this.pos.x;
                this.pos2.y = e.clientY - this.pos.y;
                handlers.onDrag(e, this.pos2, this.draggedNode);
            }

            this.pos.x = e.clientX;
            this.pos.y = e.clientY;
            return true;
        }
        return false;
    }

    /**
     * Called by renderer to listen to drag-n-drop events from node. E.g. for SVG
     * graphics we may listen to DOM events, whereas for WebGL we graphics
     * should provide custom eventing mechanism.
     *
     * @param {Ngraph.Graph.Node} node node to be monitored.
     * @param {DnDHandler} handlers - object with set of three callbacks:
     *   onStart: function(node),
     *   onDrag: function(e, offset, node),
     *   onStop: function(node)
     * @returns {void}
     */
    bindDragNDrop(node, handlers) {
        if (this.internalHandlers[node.id] != null) {
            throw new Error(`D\'n\'d handlers already exists for node #${node.id}`);
        }
        this.internalHandlers[node.id] = handlers;
    }

    /**
     * 
     * @param {Ngraph.Graph.Node} node 
     * @returns {void}
     */
    unbindDragNDrop(node) {
        if (this.internalHandlers[node.id]) {
            delete this.internalHandlers[node.id];
        }
    }
}

export class DnDHandler {
    /**
     * @param {function(MouseEvent, Point2D, Ngraph.Graph.Node):void} onStartCallback 
     * @param {function(MouseEvent, Point2D, Ngraph.Graph.Node):void} onDragCallback 
     * @param {function(Ngraph.Graph.Node):void} onStopCallback 
     */
    constructor(onStartCallback, onDragCallback, onStopCallback) {
        // TODO: add some validation
        this.onDrag = onDragCallback;
        this.onStart = onStartCallback;
        this.onStop = onStopCallback;
    }
}
