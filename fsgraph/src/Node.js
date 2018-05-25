//@ts-check
import { GraphState } from './GraphState';
import { Point2D } from './Point2D';
import { Edge } from './Edge';
import * as DH from './DataHelpers';

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
        
        this.position = new Point2D(Math.random() * 1500 - 750, Math.random() * 1500 - 750);

        /** @type {Edge[]} */
        this.edges = [];

        this.visible = true;

        this.onBeforeHideCallback = null;
    };

    get visible() {
        return this._visible;
    }

    set visible(value) {
        this._visible = value;
        if (this._visibleChekbox.checked !== value) {
            this._visibleChekbox.checked = value;
        }
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
        this._labelSpan.innerText = value;
    }

    addEdge(edge) {
       this.edges.push(edge);
    };

    /**
     * 
     * @param {NgraphGeneric.Layout} layout 
     */
    onBeforeHide(layout) {
        let layoutedPos = layout.getNodePosition(this.id);
        this.position.x = layoutedPos.x;
        this.position.y = layoutedPos.y;

        if (this.onBeforeHideCallback) {
            this.onBeforeHideCallback();
        }
    }

    postListItem(renderer) {
        let itemDiv = document.createElement('div');

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
