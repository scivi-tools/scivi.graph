//@ts-check
import Viva from './viva-proxy'
import { Node } from './Node'
import { Edge } from './Edge'
import { VivaStateView } from './VivaStateView'
import { GraphController } from './GraphController'
import { DummyMetrics } from './DummyMetrics'

/// <reference path="./types/ngraph.types.js" />

export class GraphState {
    constructor(nCount, eCount) {

        this._metrics = new DummyMetrics();
        /** @type {number[][]} */
        this.groups = [];
        /** @type {Node[]} */
        this.nodes = [];
        /** @type {Edge[]} */
        this.edges = [];
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
        // восстанавливаем узлы и связи, не забыв про их позиции и видимость
        for (let n of this.nodes) {
            // так же применяем фильтры!
            this.toggleNode(graph, layout, n, () => true, true);
        }
        for (let e of this.edges) {
            this.restoreEdge(graph, e);
        }
    }

    /**
     * 
     * @param {NgGraph} graph 
     * @param {NgGenericLayout} layout 
     */
    onBeforeDisabled(graph, layout) {
        // сохраняем позиции
        graph.forEachNode((node) => {
            node.data.onBeforeHide(layout);
        });

        // TODO: сбрасывать выделения, если есть таковое

        // и чистим нафиг контейнер графа
        graph.clear();
    }
}
