//@ts-check
import { VivaImageNodeUI } from './VivaImageNodeUI'
import $ from 'jquery'
import 'jquery-ui/ui/widgets/slider'

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

        /** @type {function(any) : void} */
        this.onNodeRender = stub;
        /** @type {function(any) : void} */
        this.onEdgeRender = stub;

        this.onNodeClick = selectNode2G;

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
     */
    getNodeUISize(value = 1, maxValue = 1) {
        let diap = this._nodeSizeDiap;
        // TODO: максимальный вес вершин нужно хранить где-то в состоянии графа (по группам!)
        return (value >= 0)
            ? (diap[0] + (diap[1] - diap[0]) * value / maxValue)
            : diap[0];
    }

    buildUI() {
        /** @type {HTMLElement} */
        let baseContainer = $('#settings')[0];
        let innerContainer = document.createElement('div');

        let nameSpan = document.createElement('span');
        nameSpan.innerHTML = '<br/>Node view:';
        baseContainer.appendChild(nameSpan);

        let sliderSpan = document.createElement('span');
        sliderSpan.textContent = 'Node size diap:';
        innerContainer.appendChild(sliderSpan);

        let sizeSlider = document.createElement('div');
        let that = this;
        $(sizeSlider).slider({
            min: _MaxNodeSizeDiap[0],
            max: _MaxNodeSizeDiap[1],
            values: that._nodeSizeDiap,
            step: 1,
            slide: (event, ui) => {
                that.setNodeSizeDiap(ui.values[0], ui.values[1]);
                console.log(`Node size diap now [${that._nodeSizeDiap[0]}, ${that._nodeSizeDiap[1]}]`);
                this._renderer.rerender();
            }
        });
        innerContainer.appendChild(sizeSlider);

        // TODO: colors & rest...

        baseContainer.appendChild(innerContainer);
    }
}

function stub() {
    ;
}

let lastNodeClicked = null;

function toggleRelatedWords(graph, nodeUI, labels, toggled) {
    nodeUI.data.colorSource = toggled ? graph.colors.NodeHighlighted : graph.colors.Node;
    graph.itself.forEachLinkedNode(nodeUI.id, (node, link) => {
        node.data.showLabel = toggled;
        labels[node.id].hidden = !toggled;
        node.data.colorSource = toggled ? graph.colors.WordHighlighted : graph.colors.Word;
        link.data.colorSource = toggled ? graph.colors.LinkHighlighted : graph.colors.Link;
    });
}

/**
 * 
 * @param {VivaImageNodeUI} nodeUI 
 */
function selectNode2G(nodeUI, graph) {
    nodeUI.buildDetailedInfo();
    if (nodeUI.node.data.groupId === 0) {
        // if (lastNodeClicked) {
        //     toggleRelatedWords(graph, lastNodeClicked, false);
        // }
        // if ((lastNodeClicked != nodeUI) && (node != null)) {
        //     toggleRelatedWords(graph, nodeUI, domLabels, true);
        //     lastNodeClicked = nodeUI;
        // } else {
        //     lastNodeClicked = null;
        // }
    }
    this._renderer.rerender();
}
