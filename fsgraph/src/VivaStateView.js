//@ts-check
import { Node } from './Node'
import { VivaImageNodeUI } from './VivaImageNodeUI'
import { VivaLinkUI } from './VivaLinkUI'
import { VivaWebGLRenderer } from './VivaWebGLRenderer'
import * as $ from 'jquery'
import 'jquery-ui/ui/widgets/slider'
/// <reference path="./types/ngraph.types.js" />

/* TODO: Пересматриваем концепцию кастомизации отображения графа
 * Теперь этот класс будет содержать инфу о том, как визуализировать связи
 * и вершины (последнее - для каждой группы)
 * Сюда нужно включить отображение размера вершин,
 * их цвета (+ связей) для всех состояний: (не)выбрано/(не)активно
 */

const _MaxNodeSizeDiap = [1, 50];
const _DefNodeSizeDiap = [7, 45];
const _MaxEdgeSizeDiap = [0.1, 50];
const _DefEdgeSizeDiap = [1, 5];

/**
 * Что-то типа ViewRules - правила отображения
 */
export class VivaStateView {
    // TODO: цвета-цветы передавать где-то здесь
    // хранить тащем-та тоже
    // картинки тоже
    /**
     * 
     * @param {number[]} colorPairs 
     * @param {string[]} nodeTypes 
     * @param {VivaWebGLRenderer} renderer 
     */
    constructor(colorPairs, nodeTypes, renderer) {

        // TODO: clon array right way
        /** @type {number[]} */
        this._nodeSizeDiap = [];
        this._nodeSizeDiap[0] = _DefNodeSizeDiap[0];
        this._nodeSizeDiap[1] = _DefNodeSizeDiap[1];
        /** @type {number[]} */
        this._edgeSizeDiap = [];
        this._edgeSizeDiap[0] = _DefEdgeSizeDiap[0];
        this._edgeSizeDiap[1] = _DefEdgeSizeDiap[1];

        this._colorPairs = colorPairs;

        /** @type {function(VivaImageNodeUI) : void} */
        this.onNodeRender = stub;
        /** @type {function(VivaLinkUI) : void} */
        this.onEdgeRender = stub;

        /** @type {function(VivaImageNodeUI, NgraphGraph.Graph, VivaWebGLRenderer) : void} */
        this.onNodeClick = selectNode2G;

        /** @type {VivaWebGLRenderer} */
        this._renderer = renderer;

        this.nodeTypes = nodeTypes;

        this.buildUI();
    }

    _setDiap(diap, from, to) {
        let changed = (from != diap[0]) || (to != diap[1]);
        if (changed) {
            diap[0] = from;
            diap[1] = to;
        }
    }

    _getInterpolated(diap, value, maxValue) {
        return (value >= 0)
        ? (diap[0] + (diap[1] - diap[0]) * value / maxValue)
        : diap[0];
    }

    /**
     * 
     * @param {number} value 
     * @param {number} maxValue 
     * @returns {number}
     */
    getNodeUISize(value = 1, maxValue = 1) {
        // TODO: максимальный вес вершин нужно хранить где-то в состоянии графа (по группам!)
        return this._getInterpolated(this._nodeSizeDiap, value, maxValue);
    }

    /**
     * 
     * @param {number} value 
     * @param {number} maxValue 
     * @returns {number}
     */
    getEdgeUISize(value = 1, maxValue = 1) {
        return this._getInterpolated(this._edgeSizeDiap, value, maxValue);
    }

    buildUI() {
        let baseContainer = $('#scivi_fsgraph_settings_appearance')[0];
        let innerContainer = document.createElement('div');
        innerContainer.id = 'scivi_fsgraph_settings_stateview';

        // let nameSpan = document.createElement('span');
        // nameSpan.innerText = 'Внешний вид:';
        // innerContainer.appendChild(nameSpan);

        const namedDiaps = document.createElement('ul');

        // TODO: done this right way
        const diapNames = ['Node size diap:', 'Edge size diap:'];
        const diapRanges = [_MaxNodeSizeDiap, _MaxEdgeSizeDiap];
        const diapSetters = [this._nodeSizeDiap, this._edgeSizeDiap];
        for (let i = 0; i < 2; i++) {
            const diapLi = document.createElement('li');
            const label = document.createElement('span');
            label.innerText = diapNames[i];

            const slider = document.createElement('div');
            const that = this;
            $(slider).slider({
                min: diapRanges[i][0],
                max: diapRanges[i][1],
                values: diapSetters[i],
                step: 1,
                range: true,
                slide: (event, ui) => {
                    that._setDiap(diapSetters[i], ui.values ? ui.values[0] : 0, ui.values ? ui.values[1] : 1);
                    that._renderer.rerender();
                }
            });

            diapLi.appendChild(label);
            diapLi.appendChild(slider);
            namedDiaps.appendChild(diapLi);
        }

        innerContainer.appendChild(namedDiaps);

        // TODO: colors & rest...

        baseContainer.appendChild(innerContainer);
    }
}

function stub() {
    ;
}

/** @type {VivaImageNodeUI?} */
let lastNodeClicked = null;

/**
 * 
 * @param {NgraphGraph.Graph} graph 
 * @param {VivaWebGLRenderer} renderer
 * @param {VivaImageNodeUI} nodeUI 
 * @param {boolean} toggled 
 */
function toggleRelatedWords(graph, renderer, nodeUI, toggled) {
    nodeUI.selected = toggled;
    let realNode = /** @type {Node} */ (nodeUI._realNode);
    // TODO: nodUI.selected, not node.selected!
    graph.forEachLinkedNode(realNode.id, (/** @type {NgraphGraph.Node} */node, /** @type {NgraphGraph.Link} */link) => {
        /** @type {VivaImageNodeUI} */
        let nodeUI = renderer.graphics.getNodeUI(node.id);
        /** @type {VivaLinkUI} */
        let linkUI = renderer.graphics.getLinkUI(link.id);
        if (node.data.groupId !== 0) {
            nodeUI.showLabel = toggled;
            nodeUI.selected = toggled;
        }
        linkUI.selected = toggled;
        if (toggled) {
            renderer.graphics.bringLinkToFront(linkUI);
        }

        return false;
    });
}

/**
 * 
 * @param {NgraphGraph.Graph} graph 
 * @param {VivaWebGLRenderer} renderer
 * @param {VivaImageNodeUI} nodeUI 
 * @param {boolean} toggled 
 */
function selectNodeByGroup(graph, renderer, nodeUI, toggled) {
    /** @type {Node} */
    let realNode = nodeUI.node.data;
    if (realNode.groupId === 0) {   
        toggleRelatedWords(graph, renderer, nodeUI, toggled);
    } else {
        nodeUI.showLabel = toggled;
        nodeUI.selected = toggled;
    }
}

/**
 * 
 * @param {VivaImageNodeUI} nodeUI 
 * @param {NgraphGraph.Graph} graph
 * @param {VivaWebGLRenderer} renderer
 */
function selectNode2G(nodeUI, graph, renderer) {
    if (nodeUI != null) {
        nodeUI.buildDetailedInfo();
        
        if (lastNodeClicked) {
            selectNodeByGroup(graph, renderer, lastNodeClicked, false);
        }
        selectNodeByGroup(graph, renderer, nodeUI, true);
        lastNodeClicked = nodeUI;
    } else {
        if (lastNodeClicked) {
            selectNodeByGroup(graph, renderer, lastNodeClicked, false);
            lastNodeClicked.detailedInfoHTML.innerHTML = '';
            lastNodeClicked = null;
        }
    }
    renderer.rerender();
}
