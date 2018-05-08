//@ts-check
import Viva from './viva-proxy'
import { Node } from './Node'
import { Edge } from './Edge'
import { VivaStateView } from './VivaStateView'
import { GraphController } from './GraphController'
import { DummyMetrics } from './DummyMetrics'
import $ from 'jquery'
import 'jquery-ui/ui/widgets/slider'
/// <reference path="./types/ngraph.types.js" />

export class GraphState {
    /**
     * 
     * @param {GraphController} controller 
     * @param {number} nCount 
     * @param {number} eCount 
     */
    constructor(controller, nCount, eCount) {
        /** @type {GraphController} */
        this._controller = controller
        this._metrics = new DummyMetrics(this._controller.monitoredValues);
        /** @type {number[][]} */
        this.groups = [];
        /** @type {Node[]} */
        this.nodes = [];
        /** @type {Edge[]} */
        this.edges = [];

        /** @type {HTMLElement} */
        this._filtersContainer = null;
        this.prevKnownValues = null;
    };

    addNode(id, groupId, label, weight) {
        // ensure that group alredy exists before pushing to it
        if (!this.groups[groupId]) {
            this.groups[groupId] = []
        }
        this.groups[groupId].push(id);

        const newNode = new Node(this, id, groupId, label, weight);
        // TODO: count some metrics here, async
        this._metrics.accumulate(newNode);

        this.nodes[id] = newNode;
    };

    addEdge(fromId, toId, weight) {
        const newEdge = new Edge(this, fromId, toId);
        this.edges.push(newEdge);

        this.nodes[fromId].addEdge(newEdge);
        this.nodes[toId].addEdge(newEdge);
        // TODO: count some metrics here
    };

    /**
     * 
     * @param {NgGraph} graph 
     * @param {Node} node
     */
    restoreNode(graph, node) {
        if (!node.visible) {
            return;
        }

        let graphNode = graph.addNode(node.id, node);
        graphNode['position'] = node.position;
    };

    /**
     * 
     * @param {NgGraph} graph 
     * @param {Edge} edge 
     */
    restoreEdge(graph, edge) {
        if (!edge.visible) {
            return;
        }

        graph.addLink(edge.fromId, edge.toId, edge);
    };

    /**
     * 
     * @param {Node} node 
     * @param {function(Node):boolean} filterFunc 
     * @param {boolean} softMode
     */
    toggleNodeExt(node, filterFunc, softMode = false) {
        this.toggleNode(this._controller.graph, this._controller.layoutInstance, node, filterFunc, softMode);
    }

    /**
     * Добавляем/удаляем узел в зависимости от фильтра
     * Последним параметром можно игнорировать изменение связей
     * @param {NgGraph} graph
     * @param {NgGenericLayout} layout
     * @param {Node} node 
     * @param {function(Node):boolean} filterFunc
     * @param {boolean} softMode 
     */
    toggleNode(graph, layout, node, filterFunc, softMode = false) {
        let prevVisible = node.visible;
        // применяем фильтр!
        let newVisible = filterFunc(node);
        if ((newVisible != prevVisible) || (softMode)) {
            node.visible = newVisible;
            if (newVisible) {
                this.restoreNode(graph, node);
                // добавим вся связанные
                if (!softMode) {
                    for (let edge of node.edges) {
                        this.toggleEdge(graph, edge);
                    }
                }
            } else {
                this.hideNode(graph, layout, node);
                // и выбросим все связанные 
                if (!softMode) {
                    for (let edge of node.edges) {
                        this.toggleEdge(graph, edge);
                    }
                }
            }
        }
    }

    /**
     * 
     * @param {NgGraph} graph 
     * @param {NgGenericLayout} layout 
     * @param {Node} node 
     */
    hideNode(graph, layout, node) {
        node.onBeforeHide(layout);
        graph.removeNode(node.id);
    }

    /**
     * 
     * @param {NgGraph} graph 
     * @param {Edge} edge 
     */
    toggleEdge(graph, edge) {
        if (edge.visibleChanged) {
            if (edge.visible) {
                this.restoreEdge(graph, edge);
            } else {
                let graphEdge = graph.getLink(edge.fromId, edge.toId);
                graph.removeLink(graphEdge);
            }
        }
    }

    /**
     * 
     * @param {NgGraph} graph 
     * @param {NgGenericLayout} layout 
     */
    actualize(graph, layout) {
        // TODO: восстанавливаем значения фильтров, если таковые есть
        this._checkBuildFilters(null);

        // восстанавливаем узлы и связи, не забыв про их позиции и видимость
        // graph.beginUpdate();
        for (let n of this.nodes) {
            // TODO: так же применяем фильтры!
            this.toggleNode(graph, layout, n, (n) => this._applyFilter(n), true);
        }
        for (let e of this.edges) {
            this.restoreEdge(graph, e);
        }
        // graph.endUpdate();
    }

    /**
     * 
     */
    onBeforeDisabled() {
        // сохраняем позиции
        this._controller.graph.forEachNode((node) => {
            node.data.onBeforeHide(this._controller.layoutInstance);
        });

        // TODO: сбрасывать выделения, если есть таковое

        // и чистим нафиг контейнер графа
        this._controller.graph.clear();

        // TODO: возвращаем знаения фильтров!
    }

    /**
     * 
     * @param {number[][]} prevKnownValues - [groupid][0, 1]
     */
    _checkBuildFilters(prevKnownValues) {
        if (!this._filtersContainer) {
            this._filtersContainer = document.createElement('div');

            const that = this;
            // так себе допущение
            let groupCount = this._metrics.maxGroupId + 1;
            for (let i = 0; i < groupCount; i++) {
                let filterSlider = document.createElement('div');
                let descrSpan = document.createElement('span');
                descrSpan.innerText = `Filter for group ${i}:`;
                $(filterSlider).slider({
                    // TODO: эти четыре будут задаваться после получения prevKnownValues
                    min: this._metrics.minMaxValuesPerGroup[i]['weight'][0],
                    max: this._metrics.minMaxValuesPerGroup[i]['weight'][1],
                    values: [this._metrics.minMaxValuesPerGroup[i]['weight'][0], this._metrics.minMaxValuesPerGroup[i]['weight'][1]],
                    step: 1,
                    range: true,
                    slide: (event, ui) => {
                        that.prevKnownValues[i]['weight'][0] = ui.values[0];
                        that.prevKnownValues[i]['weight'][1] = ui.values[1];
                        that._applyFilterRange();
                    } 
                });
                this._filtersContainer.appendChild(descrSpan);
                this._filtersContainer.appendChild(filterSlider);
            }
        }
        let parent = $('#control')[0];

        if (prevKnownValues) {
            // TODO: ....
        } else {
            this.prevKnownValues = this._metrics.minMaxValuesPerGroup;
        }

        parent.appendChild(this._filtersContainer);
    }

    /**
     * 
     * @param {Node} node
     * @param {string} value
     * @returns {boolean} 
     */
    _applyFilter(node, value = 'weight') {
        let gid = node.groupId;
        let range = this.prevKnownValues[gid][value];
        return (node[value] >= range[0]) && (node[value] <= range[1]);
    }

    _applyFilterRange(value = 'weight') {
        // this._controller.graph.beginUpdate();
        for (let n of this.nodes) {
            this.toggleNodeExt(n, (n) => this._applyFilter(n, value), false);
        }
        // this._controller.graph.endUpdate();
    }
}
