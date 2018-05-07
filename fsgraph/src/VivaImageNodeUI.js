//@ts-check
/// <reference path="./types/ngraph.types.js" />
import { VivaBaseUI } from './VivaBaseUI'
import { Node } from './Node'
import { Edge } from './Edge'
import $ from 'jquery'

export class VivaImageNodeUI extends VivaBaseUI {
    /**
     * 
     * @param {NgNode} node
     * @param {HTMLSpanElement} titleSpan 
     */
    constructor(graphics, node, titleSpan) {
        super(node.id);
        this.node = node;
        this._offset = 0;
        this._span = titleSpan;
        this._spanWidth = 0;
        this._labelChanged = true;
        this._showLabel = false;

        this._graphics = graphics;
        
        // this._invalidateLabel();

        // TODO: соптимизировать получение корневого элемента где-то ещё
        this.detailedInfoHTML = $('#info')[0];
    };

    /**
     * @returns {NgNode}
     */
    get node() {
        return this._node;
    }

    /**
     * @param {NgNode} value
     */
    set node(value) {
        /** @type {NgNode} */
        this._node = value;
        /** @type {Node} */
        this._realNode = value.data;
    }

    get label() {
        return this._realNode.label;
    }

    /**
     * @param {string} value
     */
    set label(value) {
        this._realNode.label = value;
        this._invalidateLabel();
    }

    /**
     * @param {boolean} value
     */
    set showLabel(value) {
        this._showLabel = value;
        if (value == this._span.hidden) {
            this._span.hidden = !value;
        }
    }

    _invalidateLabel() {
        this._span.innerText = this._realNode.label;
        this._spanWidth = $(this._span).width();
    }

    onRender() {
        if (this._showLabel) {
            if (this._labelChanged) {
               this._invalidateLabel();
               this._labelChanged = false;
            }
            let domPos = { x: this['position'].x, y: this['position'].y - this['size'] - 1};
            this._graphics.transformGraphToClientCoordinates(domPos);
            this._span.style.left = `${domPos.x - this._spanWidth / 2}px`;
            this._span.style.top = `${domPos.y}px`;
        }
    }

    buildDetailedInfo() {
        let header = document.createElement("div");
        let name = document.createElement("input");
        name.type = "text";
        name.value = this.label;
        name.style.fontWeight = "bold";
        name.style.width = "300px";
        name.style.marginRight = "5px";
        let changeName = document.createElement("button");
        changeName.innerHTML = "Change name";
        changeName.onclick = () => {
            this.label = name.value;
        };
        header.appendChild(name);
        header.appendChild(changeName);

        if (this._realNode['date']) {
            let dateLabel = document.createElement("span");
            dateLabel.innerHTML = "&nbsp;&nbsp;&nbsp;(" + this._realNode['date'].toLocaleDateString() + ")";
            header.appendChild(dateLabel);
        }

        let nodesList = document.createElement("div");
        let connList = "<span>Linked nodes:</span><ul>";
        this._realNode.edges.forEach((edge) => {
            if (edge.visible) {
                if (edge.toId != this._realNode.id)
                    connList += `<li><span>${this._realNode._state.nodes[edge.toId].label} --+</span></li>`;
                else
                    connList += `<li><span>+-- ${this._realNode._state.nodes[edge.fromId].label}</span></li>`;
            }
        });
        connList += "</ul>";
        nodesList.innerHTML = connList;

        this.detailedInfoHTML.innerHTML = '';

        this.detailedInfoHTML.appendChild(header);
        this.detailedInfoHTML.appendChild(nodesList);
    };
};

