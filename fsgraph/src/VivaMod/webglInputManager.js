/**
 * @author Andrei Kashcha (aka anvaka) / https://github.com/anvaka
 * @author Me
 */
//@ts-check
// <reference path="fo.js" />

import createInputEvents from 'vivagraphjs/src/WebGL/webglInputEvents'
import { Point2D } from '../Point2D';

/**
 * Ngraph node type, with all known extensions
 * @typedef {Object} NgNode
 * @property {number|string} id
 * @property {Object[]} links
 * @property {Object} data
 */

/**
 * D'n'D - drag'n'drop
 */
export class WebGLDnDManager {
    constructor(graph, graphics) {
        /** @type {Object.<string, DnDHandler>} */
        this.internalHandlers = {};

        this.inputEvents = createInputEvents(graphics);
        /** @type {NgNode} */
        this.draggedNode = null;
        this.pos = new Point2D(0, 0);
        this.pos2 = new Point2D(0, 0);

        this.inputEvents.mouseDown(this.onMouseDown.bind(this))
            .mouseUp(this.onMouseUp.bind(this))
            .mouseMove(this.onMouseMove.bind(this));
    }

    /**
     * 
     * @param {NgNode} node 
     * @param {MouseEvent} e 
     */
    onMouseDown(node, e) {
        this.draggedNode = node;
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;

        this.inputEvents.mouseCapture(this.draggedNode);

        var handlers = this.internalHandlers[node.id];
        if (handlers) {
            handlers.onStart(e, this.pos, node);
        }

        return true;
    }

    /**
     * 
     * @param {NgNode} node 
     */
    onMouseUp(node) {
        this.inputEvents.releaseMouseCapture(this.draggedNode);

        this.draggedNode = null;
        var handlers = this.internalHandlers[node.id];
        if (handlers) {
            handlers.onStop(node);
        }
        return true;
    }

    /**
     * 
     * @param {NgNode} node 
     * @param {MouseEvent} e 
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
    }

    /**
     * Called by renderer to listen to drag-n-drop events from node. E.g. for SVG
     * graphics we may listen to DOM events, whereas for WebGL we graphics
     * should provide custom eventing mechanism.
     *
     * @param {NgNode} node node to be monitored.
     * @param {DnDHandler} handlers - object with set of three callbacks:
     *   onStart: function(node),
     *   onDrag: function(e, offset, node),
     *   onStop: function(node)
     */
    bindDragNDrop(node, handlers) {
        if (this.internalHandlers[node.id] != null) {
            throw new Error(`D\'n\'d handlers already exists for node #${node.id}`);
        }
        this.internalHandlers[node.id] = handlers;
    }

    unbindDragNDrop(node) {
        if (this.internalHandlers[node.id]) {
            delete this.internalHandlers[node.id];
        }
    }
}

export class DnDHandler {
    /**
     * !!! Здесь node == nodeUI !!!
     * @param {function(MouseEvent, Point2D, NgNode):void} onStartCallback 
     * @param {function(MouseEvent, Point2D, NgNode):void} onDragCallback 
     * @param {function(NgNode):void} onStopCallback 
     */
    constructor(onStartCallback, onDragCallback, onStopCallback) {
        // TODO: add some validation
        this.onDrag = onDragCallback;
        this.onStart = onStartCallback;
        this.onStop = onStopCallback;
    }
}
