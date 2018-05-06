/**
 * @author Andrei Kashcha (aka anvaka) / https://github.com/anvaka
 * @author Me
 */
//@ts-check
// <reference path="fo.js" />

import createInputEvents from 'vivagraphjs/src/WebGL/webglInputEvents'
import { Point2D } from '../Point2D';

/**
 * @typedef {Object} VivaNode
 * @property {any} id
 */

/**
 * D'n'D - drag'n'drop
 */
export class WebGLDnDManager {
    constructor(graph, graphics) {
        this.internalHandlers = {};

        this.inputEvents = createInputEvents(graphics);
        /** @type {VivaNode} */
        this.draggedNode = null;
        this.pos = new Point2D(0, 0);
        this.pos2 = new Point2D(0, 0);

        this.inputEvents.mouseDown(this.onMouseDown.bind(this))
            .mouseUp(this.onMouseUp.bind(this))
            .mouseMove(this.onMouseMove.bind(this));
    }

    /**
     * 
     * @param {VivaNode} node 
     * @param {MouseEvent} e 
     */
    onMouseDown(node, e) {
        this.draggedNode = node;
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;

        this.inputEvents.mouseCapture(this.draggedNode);

        var handlers = this.internalHandlers[node.id];
        if (handlers && handlers.onStart) {
            handlers.onStart(e, this.pos);
        }

        return true;
    }

    /**
     * 
     * @param {VivaNode} node 
     */
    onMouseUp(node) {
        this.inputEvents.releaseMouseCapture(this.draggedNode);

        this.draggedNode = null;
        var handlers = this.internalHandlers[node.id];
        if (handlers && handlers.onStop) {
            handlers.onStop();
        }
        return true;
    }

    /**
     * 
     * @param {VivaNode} node 
     * @param {MouseEvent} e 
     */
    onMouseMove(node, e) {
        if (this.draggedNode) {
            var handlers = this.internalHandlers[this.draggedNode.id];
            if (handlers && handlers.onDrag) {
                this.pos2.x = e.clientX - this.pos.x;
                this.pos2.y = e.clientY - this.pos.y;
                handlers.onDrag(e, this.pos2);
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
     * @param {VivaNode} node node to be monitored.
     * @param {*} handlers - object with set of three callbacks:
     *   onStart: function(),
     *   onDrag: function(e, offset),
     *   onStop: function()
     */
    bindDragNDrop(node, handlers) {
        this.internalHandlers[node.id] = handlers;
        if (!handlers) {
            delete this.internalHandlers[node.id];
        }
    }
}
