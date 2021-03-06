import { GraphState } from './GraphState';
import { Point2D } from './Point2D';
import { Edge } from './Edge';
import * as DH from './DataHelpers';
import { VivaWebGLRenderer } from './VivaWebGLRenderer';

export class Node {
    /**
     * 
     * @param {GraphState} state 
     * @param {*} id 
     * @param {*} groupId 
     * @param {Object.<string, *>} data 
     */
    constructor(state, id, groupId, data) {
        this._state = state;

        this._visibleChekbox = document.createElement("input");
        this._visibleChekbox.type = 'checkbox';
        this._labelSpan = document.createElement('span');

        this.id = id;
        /** @type {string} */
        this.label = DH.getValueDef(data, 'label', 'string', 'no_label');
        this.groupId = groupId;
        /** @type {number} */
        this.weight = DH.getValueDef(data, 'weight', 'number', 1);
        /** @type {Number} */
        this.weight_norm = 0.0;
        this.position = new Point2D(Math.random() * 1500 - 750, Math.random() * 1500 - 750);

        /** @type {Edge[]} */
        this.edges = [];

        this.visible = false;

        /** @type {(function():void)?} */
        this.onBeforeHideCallback = null;

        this.isPinned = false;
    };

    get visible() {
        return this._visible;
    }

    set visible(value) {
        /** @type {boolean} */
        this._visible = value;
        if (this._visibleChekbox.checked !== value) {
            this._visibleChekbox.checked = value || false;
        }
    }

    get label() {
        return this._label;
    }

    set label(value) {
        /** @type {any} */
        this._label = value;
        this._labelSpan.innerText = value;
    }

    /**
     * 
     * @param {Edge} edge 
     */
    addEdge(edge) {
       this.edges.push(edge);
    };

    /**
     * 
     * @param {Ngraph.Generic.Layout} layout 
     */
    onBeforeHide(layout) {
        let layoutedPos = layout.getNodePosition(this.id);
        this.position.x = layoutedPos.x;
        this.position.y = layoutedPos.y;
        this.isPinned = layout.isNodePinned(/** @type {any} */(this));

        if (this.onBeforeHideCallback) {
            this.onBeforeHideCallback();
        }
    }

    /**
     * 
     * @param {VivaWebGLRenderer} renderer 
     */
    postListItem(renderer) {
        let itemDiv = document.createElement('li');

        // Проверочка видимости
        this._visibleChekbox.onchange = (ev) => {
            this._state.toggleNodeExt(this, () => this._visibleChekbox.checked, false);
            renderer.rerender();
        };
        // Название веришны
        this._labelSpan.onclick = (ev) => {
            const nodeUI = renderer._graphics.getNodeUI(this.id);
            if (nodeUI) {
                renderer.centerAtGraphPoint(nodeUI.position);
                renderer.rerender();
            }
        };

        itemDiv.appendChild(this._visibleChekbox);
        itemDiv.appendChild(this._labelSpan);
        return itemDiv;
    }
}
