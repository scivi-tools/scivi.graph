//@ts-check
/// <reference path="./@types/ngraph.d.ts" />
/// <reference path="./@types/viva.generic.d.ts" />
import { VivaBaseUI } from './VivaBaseUI';
import { Node } from './Node';
import { Edge } from './Edge';
import { Point2D } from './Point2D';
import { getOrCreateTranslatorInstance } from './Misc/Translator';
import * as $ from 'jquery';

/**
 * @implements {VivaGeneric.NodeUI}
 */
export class VivaImageNodeUI extends VivaBaseUI {
    /**
     * @param {*} graphics webglGraphics
     * @param {NgraphGraph.Node} node
     * @param {HTMLSpanElement} titleSpan 
     */
    constructor(graphics, node, titleSpan) {
        super(node.id);
        this.node = node;
        this._offset = 0;
        this._span = titleSpan;
        this._spanWidth = 0;
        this._spanHeight = 0;
        this._labelChanged = true;
        this._showLabel = false;

        this._graphics = graphics;

        this.position = new Point2D();

        // this._invalidateLabel();

        // TODO: соптимизировать получение корневого элемента где-то ещё
        this.detailedInfoHTML = $('#scivi_fsgraph_info')[0];

        // TODO: workaround assert if interface is implemented
        // https://github.com/Microsoft/TypeScript/issues/17498#issuecomment-399439654   
        /** @type {VivaGeneric.NodeUI} */
        const assertion = this;
    };

    /**
     * @returns {NgraphGraph.Node}
     */
    get node() {
        return this._node;
    }

    /**
     * @param {NgraphGraph.Node} value
     */
    set node(value) {
        /** @type {NgraphGraph.Node} */
        this._node = value;
        /** @type {Node} */
        this._realNode = value.data;

        this._realNode.onBeforeHideCallback = () => {
            this.showLabel = false;
        };
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
        this._spanHeight = $(this._span).height();
    }

    onRender() {
        if (this._showLabel) {
            // HACK: вах какой костыль!
            if (this._span.hidden === this._showLabel) {
                this._labelChanged = true;
                this.showLabel = this._showLabel;
            }
            if (this._labelChanged) {
                this._invalidateLabel();
                this._labelChanged = false;
            }
            let domPos = { x: this.position.x, y: this.position.y - this.size };
            this._graphics.transformGraphToClientCoordinates(domPos);
            this._span.style.left = `${domPos.x - this._spanWidth / 2}px`;
            this._span.style.top = `${domPos.y - this._spanHeight}px`;
        }
    }

    buildDetailedInfo() {
        const tr = getOrCreateTranslatorInstance();
        let header = document.createElement("div");
        let name = document.createElement("input");
        name.type = "text";
        name.value = this.label;
        name.style.fontWeight = "bold";
        name.style.width = "300px";
        name.style.marginRight = "5px";
        let changeName = document.createElement("button");
        changeName.innerText = tr.apply('#change_name');
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

        let nodeListContainer = document.createElement("div");
        nodeListContainer.id = 'scivi_fsgraph_nodelist_container';
        let outcomingNodesList = document.createElement("div");
        let incomingNodesList = document.createElement("div");
        let connList = `<span>${tr.apply('#outcoming_nodes')}:</span><ul>`;
        let connList2 = `<span>${tr.apply('#incoming_nodes')}:</span><ul>`;
        this._realNode.edges.forEach((edge) => {
            if (edge.visible) {
                if (edge.toId != this._realNode.id)
                    connList += `<li><span>${this._realNode._state.nodes[edge.toId].label}</span></li>`;
                else
                    connList2 += `<li><span>${this._realNode._state.nodes[edge.fromId].label}</span></li>`;
            }
        });
        connList += "</ul>";
        connList2 += "</ul>";
        outcomingNodesList.innerHTML = connList;
        incomingNodesList.innerHTML = connList2;

        this.detailedInfoHTML.innerHTML = '';

        this.detailedInfoHTML.appendChild(header);
        nodeListContainer.appendChild(outcomingNodesList);
        nodeListContainer.appendChild(incomingNodesList);
        this.detailedInfoHTML.appendChild(nodeListContainer);
    };
};

