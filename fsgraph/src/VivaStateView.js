//@ts-check
import { Node } from './Node'
import { VivaImageNodeUI } from './VivaImageNodeUI'
import { VivaLinkUI } from './VivaLinkUI'
import { VivaWebGLRenderer } from './VivaWebGLRenderer'
import $ from 'jquery'
import 'jquery-ui/ui/widgets/slider'
/// <reference path="./types/ngraph.types.js" />

/* TODO: Пересматриваем концепцию кастомизации отображения графа
 * Теперь этот класс будет содержать инфу о том, как визуализировать связи
 * и вершины (последнее - для каждой группы)
 * Сюда нужно включить отображение размера вершин,
 * их цвета (+ связей) для всех состояний: (не)выбрано/(не)активно
 */

const _MaxNodeSizeDiap = [1, 50];
const _DefNodeSizeDiap = [1, 10];

/**
 * Что-то типа ViewRules - правила отображения
 */
export class VivaStateView {
    // TODO: цвета-цветы передавать где-то здесь
    // хранить тащем-та тоже
    // картинки тоже
    constructor(colorPairs, imgSources, renderer) {

        // TODO: clon array right way
        this._nodeSizeDiap = [];
        this._nodeSizeDiap[0] = _DefNodeSizeDiap[0];
        this._nodeSizeDiap[1] = _DefNodeSizeDiap[1];

        this._colorPairs = colorPairs;

        /** @type {function(VivaImageNodeUI) : void} */
        this.onNodeRender = stub;
        /** @type {function(VivaLinkUI) : void} */
        this.onEdgeRender = stub;

        /** @type {function(VivaImageNodeUI, NgGraph, VivaWebGLRenderer) : void} */
        this.onNodeClick = selectNode2G;

        /** @type {VivaWebGLRenderer} */
        this._renderer = renderer;

        this.buildUI();
    }

    get nodeSizeDiap() {
        return this._nodeSizeDiap;
    }

    setNodeSizeDiap(from, to) {
        let diap = this._nodeSizeDiap;
        let changed = (from != diap[0]) || (to != diap[1]);
        if (changed) {
            diap[0] = from;
            diap[1] = to;
        }
    }

    /**
     * 
     * @param {number} value 
     * @param {number} maxValue 
     * @returns {number}
     */
    getNodeUISize(value = 1, maxValue = 1) {
        let diap = this._nodeSizeDiap;
        // TODO: максимальный вес вершин нужно хранить где-то в состоянии графа (по группам!)
        return (value >= 0)
            ? (diap[0] + (diap[1] - diap[0]) * value / maxValue)
            : diap[0];
    }

    buildUI() {
        let baseContainer = $('#settings')[0];
        let innerContainer = document.createElement('div');

        let nameSpan = document.createElement('span');
        nameSpan.innerHTML = '<br/>Node view:';
        baseContainer.appendChild(nameSpan);

        let sliderSpan = document.createElement('span');
        sliderSpan.textContent = 'Node size diap:';
        innerContainer.appendChild(sliderSpan);

        let sizeSlider = document.createElement('div');
        const that = this;
        $(sizeSlider).slider({
            min: _MaxNodeSizeDiap[0],
            max: _MaxNodeSizeDiap[1],
            values: that._nodeSizeDiap,
            step: 1,
            range: true,
            slide: (event, ui) => {
                that.setNodeSizeDiap(ui.values[0], ui.values[1]);
                console.log(`Node size diap now [${that._nodeSizeDiap[0]}, ${that._nodeSizeDiap[1]}]`);
                that._renderer.rerender();
            }
        });
        innerContainer.appendChild(sizeSlider);

        // TODO: colors & rest...

        // Filters
        baseContainer.appendChild(innerContainer);

        baseContainer = $('#control')[0];
    }
}

function stub() {
    ;
}

let lastNodeClicked = null;

/**
 * 
 * @param {NgGraph} graph 
 * @param {VivaWebGLRenderer} renderer
 * @param {VivaImageNodeUI} nodeUI 
 * @param {boolean} toggled 
 */
function toggleRelatedWords(graph, renderer, nodeUI, toggled) {
    nodeUI.selected = toggled;
    // TODO: nodUI.selected, not node.selected!
    graph.forEachLinkedNode(nodeUI._realNode.id, (/** @type {NgNode} */node, /** @type {NgLink} */link) => {
        /** @type {VivaImageNodeUI} */
        let nodeUI = renderer.graphics.getNodeUI(node.id);
        /** @type {VivaLinkUI} */
        let linkUI = renderer.graphics.getLinkUI(link.id);
        nodeUI.showLabel = toggled;
        nodeUI.selected = toggled;
        linkUI.selected = toggled;
    });
}

/**
 * 
 * @param {VivaImageNodeUI} nodeUI 
 * @param {NgGraph} graph
 * @param {VivaWebGLRenderer} renderer
 */
function selectNode2G(nodeUI, graph, renderer) {
    nodeUI.buildDetailedInfo();
    /** @type {Node} */
    let realNode = nodeUI.node.data;
    if (realNode.groupId === 0) {
        if (lastNodeClicked) {
            toggleRelatedWords(graph, renderer, lastNodeClicked, false);
        }
        if (lastNodeClicked != nodeUI) {
            toggleRelatedWords(graph, renderer, nodeUI, true);
            lastNodeClicked = nodeUI;
        } else {
            lastNodeClicked = null;
        }
    }
    renderer.rerender();
}
