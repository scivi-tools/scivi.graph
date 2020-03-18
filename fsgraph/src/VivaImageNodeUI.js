
import { VivaBaseUI } from './VivaBaseUI';
import { Node } from './Node';
import { Edge } from './Edge';
import { Point2D } from './Point2D';
import { getOrCreateTranslatorInstance } from '@scivi/utils';
import * as $ from 'jquery';
import {SelectionMode} from "./SelectionMode";
import {VivaStateView, _MaxNodeSizeDiap} from "./VivaStateView";

/**
 * @implements {VivaGeneric.NodeUI}
 */
export class VivaImageNodeUI extends VivaBaseUI {
    /**
     * @param {VivaGeneric.WebGlGraphics} graphics
     * @param {Ngraph.Graph.Node} node
     * @param {HTMLSpanElement} titleSpan 
     */
    constructor(graphics, node, titleSpan) {
        super(graphics, node.id, node.data.weight_norm);
        this.node = node;
        this._offset = 0;
        this._span = titleSpan;
        this._spanWidth = 0;
        this._spanHeight = 0;
        this._spanOpacity = this._span.style.opacity;
        this._labelChanged = true;
        this._showLabel = false;
        this.isClicked = false;

        //this._graphics = graphics;
        this.labelDirection = {x: 0, y:0};

        //Координаты в которых будем рисовать ноду
        this._drawPosition = {x: 0, y: 0};
        this._maxPositionOffsetLength = 0;
        //Сюда будем сохранять координаты вершины до смещения при отрисовке заголовка
        this._position = {x: 0, y: 0};

        // this._invalidateLabel();

        // TODO: соптимизировать получение корневого элемента где-то ещё
        this.detailedInfoHTML = $('#scivi_fsgraph_info')[0];

        // TODO: workaround assert if interface is implemented
        // https://github.com/Microsoft/TypeScript/issues/17498#issuecomment-399439654   
        /** @type {VivaGeneric.NodeUI} */
        const assertion = this;
    };

    /**
     * @returns {Ngraph.Graph.Node}
     */
    get node() {
        return this._node;
    }

    get size()
    {
        var coeff = this._size > 40 ? 0.5 : 2.0;
        return this._size;// * (this.graphics.getScaleFactor() < 1 ? coeff / this.graphics.getScaleFactor() : coeff);
    }

    set size(value)
    {
        this._size = value;
        this._maxPositionOffsetLength = value * 2.0;
    }

    /**
     * @param {Ngraph.Graph.Node} value
     */
    set node(value) {
        /** @type {Ngraph.Graph.Node} */
        this._node = value;
        /** @type {Node} */
        this._realNode = value.data;

        this._realNode.onBeforeHideCallback = () => {
            this.showLabel = false;
        };
    }

    set position(value)
    {
        this._position = value;
    }

    get position()
    {
        return this._position;
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

    get drawPosition()
    {
        return this._drawPosition;
    }

    set drawPosition(value)
    {
        var offset = {x: value.x - this._position.x, y: value.y - this._position.y};
        var offset_length = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
        if (offset_length > 0)
        {
            var normalized_offset_length = Math.min(this._maxPositionOffsetLength, offset_length);
            offset.x *= normalized_offset_length / offset_length;
            offset.y *= normalized_offset_length / offset_length;
        }
        this._drawPosition.x = this.position.x + offset.x;
        this._drawPosition.y = this.position.y + offset.y;
    }

    /**
     * @param {boolean} value
     */
    set showLabel(value) {
        this._showLabel = value;
        if (value === this._span.hidden) {
            this._span.hidden = !value;
        }
    }

    isSelected()
    {
        return this.isClicked || super.isSelected();
    }

    _invalidateLabel() {
        this._span.innerText = this._realNode.label;
        this._spanWidth = $(this._span).width();
        this._spanHeight = $(this._span).height();
    }

    onRender() {
        this.showLabel = this.isSelected();
        if (this._showLabel) {
            // HACK: вах какой костыль!
            /*if (this._span.hidden) {
                this._labelChanged = true;
                this.showLabel = true;
            }
            if (this._labelChanged) {
                this._invalidateLabel();
                this._labelChanged = false;
            }*/
            this._invalidateLabel();

            let angle = 0;
            let domPos = this.drawPosition;
            let size = this.size;
            //нормировка labelDirection
            let vec_len = Math.sqrt(this.labelDirection.x * this.labelDirection.x + this.labelDirection.y * this.labelDirection.y);
            if (vec_len > 0) {
                this.labelDirection.x /= vec_len;
                this.labelDirection.y /= vec_len;

                if (this.labelDirection.x >= Math.sqrt(2) / 2.0)
                    this.labelDirection.x = 1.0;
                else if (this.labelDirection.x <= -Math.sqrt(2) / 2.0)
                    this.labelDirection.x = -1.0;
                else this.labelDirection.x = 0.0;

                if (this.labelDirection.y >= Math.sqrt(2) / 2.0)
                    this.labelDirection.y = 1.0;
                else if (this.labelDirection.y <= -Math.sqrt(2) / 2.0)
                    this.labelDirection.y = -1.0;
                else this.labelDirection.y = 0.0;

                if (Math.abs(this.labelDirection.x) !== 0)
                    angle = Math.atan(this.labelDirection.y / this.labelDirection.x);

                if (this.labelDirection.x !== 0.0)
                    this.labelDirection.x *= (size / 2.0 + this._spanWidth / 2.0);
                if (this.labelDirection.y !== 0.0)
                    this.labelDirection.y *= (size / 2.0 + this._spanHeight);
            }
            this.graphics.transformGraphToClientCoordinates(domPos);
            this._span.style.transform = `translate(${domPos.x - this._spanWidth / 2}px, ${domPos.y - this._spanHeight / 2}px)`;
            this._span.style.transform += `scale(${this.graphics.getScaleFactor() + size / _MaxNodeSizeDiap[1]})`;
            if (this.selectionMode === SelectionMode.SELECTED_LIKE_ADJACENT) {
                let globalAngle = this.graphics.getRotationAngle();
                if (angle - globalAngle > Math.PI / 2.0) angle -= Math.PI;
                if (angle - globalAngle < -Math.PI / 2.0) angle += Math.PI;
                //this._span.style.transform += `rotate(${-globalAngle}rad)`;
                this._span.style.transform += `translate(${this.labelDirection.x}px,
                                                        ${this.labelDirection.y}px)`;
            }
            else
                this._span.style.transform += `translate(${0}px, 
                                                        ${-size / 2}px)`;
            this._span.style.transform += `rotate(${angle}rad)`;
            this._span.style.opacity = this.isSelected ? '1' : this._spanOpacity;

        }
    }

    onSelectedChanged() {
        super.onSelectedChanged();
        /*if (this.selected)
            this.graphics.bringNodeToFront(this);*/
    }

    buildDetailedInfo() {
        const tr = getOrCreateTranslatorInstance();
        let info = document.createElement("div");
        info.id = this._span.className + "_info";

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
                if (edge.toId !== this._realNode.id)
                    connList += `<li><span>${this._realNode._state.nodes[edge.toId].label}</span></li>`;
                else
                    connList2 += `<li><span>${this._realNode._state.nodes[edge.fromId].label}</span></li>`;
            }
        });
        connList += "</ul>";
        connList2 += "</ul>";
        outcomingNodesList.innerHTML = connList;
        incomingNodesList.innerHTML = connList2;

        //this.detailedInfoHTML.innerHTML = '';
        this.detailedInfoHTML.appendChild(info);
        info.appendChild(header);
        nodeListContainer.appendChild(outcomingNodesList);
        nodeListContainer.appendChild(incomingNodesList);
        info.appendChild(nodeListContainer);
    };
};

