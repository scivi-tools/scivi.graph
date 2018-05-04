//@ts-check
import { GraphState } from './GraphState'

export class Node {
    constructor(/** @type {GraphState} */state, id, groupId, /** @type{string} */label, weight, data = null) {
        this._state = state;

        this._visibleChekbox = document.createElement("input");
        this._visibleChekbox.type = 'checkbox';
        this._labelSpan = document.createElement('span');

        this.id = id;
        this.label = label;
        this.groupId = groupId;
        this.weight = weight;
        this.data = data;
        
        this.position = new Position(0, 0);

        this.edges = [];

        this.visible = true;
    };

    get visible() {
        return this._visible;
    }

    set visible(value) {
        this._visible = value;
        this._visibleChekbox.checked = value;
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

    onBeforeHide(layout) {
        let layoutedPos = layout.getNodePosition(this.id);
        this.position.x = layoutedPos.x;
        this.position.y = layoutedPos.y;
    }

    postListItem() {
        let itemDiv = document.createElement('div');

        // Проверочка видимости
        this._visibleChekbox.onchange = (ev) => {
            this.visible = this._visibleChekbox.checked;
            // TODO: kick renderer
        };
        // Название веришны
        this._labelSpan.onclick = (ev) => {
            console.log(`U clicked on ${this._label}!`);
        };

        itemDiv.appendChild(this._visibleChekbox);
        itemDiv.appendChild(this._labelSpan);
        return itemDiv;
    }
}

export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
