//@ts-check
import Viva from './viva-proxy';
import { Node } from './Node';
import { Edge } from './Edge';
import { VivaStateView } from './VivaStateView';
import { GraphController } from './GraphController';
import { DummyMetrics } from './DummyMetrics';
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';

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
        this._edgeMetrics = new DummyMetrics(this._controller.monitoredValues);
        /** @type {number[][]} */
        this.groups = [];
        /** @type {Node[]} */
        this.nodes = [];
        /** @type {Edge[]} */
        this.edges = [];

        /** @type {HTMLElement} */
        this._filtersContainer = null;
        this.prevKnownValues = null;

        this._visited = false;
    };

    addNode(id, groupId, data) {
        // ensure that group alredy exists before pushing to it
        if (!this.groups[groupId]) {
            this.groups[groupId] = []
        }
        this.groups[groupId].push(id);

        const newNode = new Node(this, id, groupId, data);
        // TODO: count some metrics here, async
        this._metrics.accumulate(newNode);

        this.nodes[id] = newNode;
    };

    addEdge(fromId, toId, data) {
        const newEdge = new Edge(this, fromId, toId, data);
        this.edges.push(newEdge);

        this.nodes[fromId].addEdge(newEdge);
        this.nodes[toId].addEdge(newEdge);
        // TODO: count some metrics here
        //@ts-ignore
        this._edgeMetrics.accumulate(newEdge);
    };

    /**
     * 
     * @param {NgraphGraph.Graph} graph 
     * @param {Node} node
     */
    restoreNode(graph, node) {
        if (!node.visible) {
            return;
        }

        graph.beginUpdate();
        let graphNode = graph.addNode(node.id, node);
        graphNode['position'] = node.position;
        graphNode['size'] = 42;
        graph.endUpdate();
    };

    /**
     * 
     * @param {Edge} edge 
     */
    restoreEdge(edge) {
        if (!edge.visible) {
            return;
        }

        this._controller.graph.beginUpdate();
        let graphLink = this._controller.graph.addLink(edge.fromId, edge.toId, edge);
        graphLink['weight'] = edge.weight;
        this._controller.graph.endUpdate();
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
     * @param {NgraphGraph.Graph} graph
     * @param {NgraphGeneric.Layout} layout
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
     * @param {NgraphGraph.Graph} graph 
     * @param {NgraphGeneric.Layout} layout 
     * @param {Node} node 
     */
    hideNode(graph, layout, node) {
        node.onBeforeHide(layout);
        graph.removeNode(node.id);
    }

    /**
     * 
     * @param {NgraphGraph.Graph} graph 
     * @param {Edge} edge 
     */
    toggleEdge(graph, edge) {
        if (edge.visibleChanged) {
            if (edge.visible) {
                this.restoreEdge(edge);
            } else {
                let graphEdge = graph.getLink(edge.fromId, edge.toId);
                graph.removeLink(graphEdge);
            }
        }
    }

    /**
     * 
     */
    actualize(renderer) {
        // TODO: восстанавливаем значения фильтров, если таковые есть
        this._checkBuildFilters(null, renderer);

        // восстанавливаем узлы и связи, не забыв про их позиции и видимость
        // graph.beginUpdate();
        this.forEachNode((n) => {
            this.toggleNodeExt(n, (n) => this._applyFilter(n), true);
        });
        for (let e of this.edges) {
            this.restoreEdge(e);
        }
        // graph.endUpdate();

        this._visited = true;
    }

    pseudoActualize() {
        // TODO: get rid of duplicated code
        this.forEachNode((n) => {
            this.toggleNodeExt(n, (n) => this._applyFilter(n));
        });
        for (let e of this.edges) {
            this.restoreEdge(e);
        }
    }

    pseudoDisable() {
        this.forEachNode((n) => {
            this.toggleNodeExt(n, (n) => false);
        });
    }

    /**
     * 
     */
    onBeforeDisabled() {
        // сохраняем позиции
        this._controller.graph.forEachNode((node) => {
            node.data.onBeforeHide(this._controller.layoutInstance);
            return false;
        });

        // TODO: сбрасывать выделения, если есть таковое

        // и чистим нафиг контейнер графа
        this._controller.graph.clear();

        // TODO: возвращаем знаения фильтров!

        $('#scivi_fsgraph_control')[0].removeChild(this._filtersContainer);
    }

    /**
     * 
     * @param {function(Node):void} nodeCallback 
     */
    forEachNode(nodeCallback) {
        for (let n of this.nodes) {
            if (n) {
                nodeCallback(n);
            }
        }
    }

    /**
     * 
     * @param {GraphState} prev 
     */
    syncWithPrevious(prev) {
        // TODO: почти очвевидно. чт синхронизация позиций работает неверно:
        // если у нас вершина с ид Х есть в состоянии 0 и 2, но не в 1, то
        // у неё будут разные координаты в 0 и 2
        if ((!this._visited) && (prev._visited)) {
            let node = null;
            this.forEachNode((n) => {
                node = prev.nodes[n.id];
                if (node) {
                    n.position = node.position;
                    n.isPinned = node.isPinned;
                }
            });
        }

        // TODO: sync filters!
    }

    /**
     * 
     * @param {number[][]} prevKnownValues Format: [groupid][0, 1]
     * @param {*} renderer
     */
    _checkBuildFilters(prevKnownValues, renderer) {
        if (!this._filtersContainer) {
            this._filtersContainer = document.createElement('div');

            const that = this;
            // так себе допущение
            let groupCount = this._metrics.maxGroupId + 1;
            for (let i = 0; i < groupCount; i++) {
                let filterSlider = document.createElement('div');
                let descrSpan = document.createElement('span');
                descrSpan.innerText = `Filter for group ${i}:`;
                filterSlider.style.margin = '10px';
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
                        renderer.rerender();
                    } 
                });
                this._filtersContainer.appendChild(descrSpan);
                this._filtersContainer.appendChild(filterSlider);
            }
        }
        let parent = $('#scivi_fsgraph_control')[0];

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
        this._controller.graph.beginUpdate();
        this.forEachNode((n) => {
            this.toggleNodeExt(n, (n) => this._applyFilter(n, value), false);
        });
        this._controller.graph.endUpdate();
    }
}
