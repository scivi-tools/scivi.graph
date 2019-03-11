import Viva from './viva-proxy';
import { Node } from './Node';
import { Edge } from './Edge';
import { VivaStateView } from './VivaStateView';
import { GraphController } from './GraphController';
import { DummyMetrics } from './DummyMetrics';
import { getOrCreateTranslatorInstance } from './Misc/Translator';
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';

export class GraphState {
    /**
     * 
     * @param {GraphController} controller 
     * @param {number} nCount 
     * @param {number} eCount 
     * @param {string} label
     */
    constructor(controller, nCount, eCount, label) {
        /** @type {GraphController} */
        this._controller = controller;
        this._metrics = new DummyMetrics(this._controller.monitoredValues);
        this._edgeMetrics = new DummyMetrics(this._controller.monitoredValues);
        /** @type {number[][]} */
        this.groups = [];
        /** @type {Node[]} */
        this.nodes = [];
        /** @type {Edge[]} */
        this.edges = [];
        this._label = label;

        /** @type {HTMLElement?} */
        this._filtersContainer = null;
        /** @type {Object.<string, number[]>[]?} */
        this.prevKnownValues = null;

        this._visited = false;
    };

    get label() {
        return this._label;
    }

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
        // @ts-ignore
        this._edgeMetrics.accumulate(newEdge);
    };

    /**
     * 
     * @param {Node} node
     */
    restoreNode(node) {
        if (!node.visible) {
            return;
        }

        this._controller.graph.beginUpdate();
        let graphNode = this._controller.graph.addNode(node.id, node);
        graphNode['position'] = node.position;
        graphNode['size'] = 42;
        this._controller.graph.endUpdate();
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
     * Добавляем/удаляем узел в зависимости от фильтра
     * Последним параметром можно игнорировать изменение связей
     * @param {Node} node 
     * @param {function(Node):boolean} filterFunc 
     * @param {boolean} softMode
     */
    toggleNodeExt(node, filterFunc, softMode = false) {
        let prevVisible = node.visible;
        // применяем фильтр!
        let newVisible = filterFunc(node);
        if (newVisible != prevVisible) {
            node.visible = newVisible;
            if (newVisible) {
                this.restoreNode(node);
            } else {
                this.hideNode(node);
            }
            // добавим или выбросим все связанные 
            if (!softMode) {
                for (let edge of node.edges) {
                    this.toggleEdge(edge);
                }
            }
        }
    }

    /**
     * 
     * @param {Node} node 
     * @param {function(Node):boolean} filterFunc 
     */
    restoreNodeIf(node, filterFunc) {
        node.visible = filterFunc(node);
        this.restoreNode(node);
    }

    /**
     * 
     * @param {Node} node 
     */
    hideNode(node) {
        node.onBeforeHide(this._controller.layoutInstance);
        this._controller.graph.removeNode(node.id);
    }

    /**
     * 
     * @param {Edge} edge 
     */
    hideEdge(edge) {
        let graphEdge = this._controller.graph.getLink(edge.fromId, edge.toId);
        this._controller.graph.removeLink(graphEdge);
    }

    /**
     * 
     * @param {Edge} edge 
     */
    toggleEdge(edge) {
        if (edge.visibleChanged) {
            if (edge.visible) {
                this.restoreEdge(edge);
            } else {
                this.hideEdge(edge);
            }
        }
    }

    /**
     * @param {Object.<string, number[]>[]?} prevFilterValues
     */
    actualize(prevFilterValues) {
        // TODO: восстанавливаем значения фильтров, если таковые есть
        this._checkBuildFilters(prevFilterValues);

        // восстанавливаем узлы и связи, не забыв про их позиции и видимость
        // graph.beginUpdate();
        this.forEachNode((n) => {
            this.restoreNodeIf(n, (n) => this._applyFilter(n));
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
            this.toggleNodeExt(n, (n) => this._applyFilter(n), false);
        });
    }

    pseudoDisable() {
        this.forEachNode((n) => {
            this.toggleNodeExt(n, (n) => false, false);
        });
    }

    /**
     * @returns {Object.<string, number[]>[]?}
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
        if (!!this._filtersContainer) {
            $('#scivi_fsgraph_control')[0].removeChild(this._filtersContainer);
        }
        return this.prevKnownValues;
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
    }

    /**
     * 
     * @param {Object.<string, number[]>[]?} prevKnownValues Format: [groupid][0, 1]
     */
    _checkBuildFilters(prevKnownValues) {
        if (prevKnownValues) {
            this.prevKnownValues = prevKnownValues;
        } else {
            this.prevKnownValues = this._metrics.minMaxValuesPerGroup;
        }

        const filterItemsPresented = !!this._filtersContainer;
        if (!filterItemsPresented) {
            const tr = getOrCreateTranslatorInstance();
            this._filtersContainer = document.createElement('div');
            this._filtersContainer.innerHTML = `<span>${tr.apply('#state_hint')}: </span>`;
            let filtersList = document.createElement('ul');
            const that = this;
            // так себе допущение
            let groupCount = this._metrics.maxGroupId + 1;
            // HACK: вот уж где так нехватает реактивного программирования, как здесь
            for (let i = 0; i < groupCount; i++) {
                let listItem = document.createElement('li');
                listItem.innerHTML = `<span><label>${tr.apply('#for_group')}</label><label> ${i}: </label><label id="scivi_fsgraph_filter_${i}_values"></label></span>`;
                // TODO: inefficient!
                let filterLabel = /** @type {HTMLElement} */(listItem.childNodes.item(0).childNodes.item(2));
                /**
                 * 
                 * @param {number[]} values 
                 * @param {number[]} minMaxValues 
                 */
                const setLabel = (values, minMaxValues) => {
                    filterLabel.innerText = `${Math.max(values[0], minMaxValues[0])}..${Math.min(values[1], minMaxValues[1])}`;
                };
                setLabel(this.prevKnownValues[i]['weight'], this._metrics.minMaxValuesPerGroup[i]['weight']);
                let filterSlider = document.createElement('div');
                filterSlider.id = `filter-slider-${i}`;
                $(filterSlider).slider({
                    // TODO: эти четыре будут задаваться после получения prevKnownValues
                    min: this._metrics.minMaxValuesPerGroup[i]['weight'][0],
                    max: this._metrics.minMaxValuesPerGroup[i]['weight'][1],
                    values: [this.prevKnownValues[i]['weight'][0], this.prevKnownValues[i]['weight'][1]],
                    step: 1,
                    range: true,
                    slide: (event, ui) => {
                        if (!ui.values) {
                            return;
                        }
                        if (!that.prevKnownValues) {
                            console.warn(`Can not apply filter: no stats were computed!`);
                            return;
                        }
                        that.prevKnownValues[i]['weight'][0] = ui.values[0];
                        that.prevKnownValues[i]['weight'][1] = ui.values[1];
                        setLabel(ui.values, ui.values);
                        that._applyFilterRange();
                        if (!!that._controller._onStateUpdated) {
                            that._controller._onStateUpdated();
                        }
                    } 
                });
                listItem.appendChild(filterSlider);
                listItem.appendChild((() => {
                    const res = document.createElement('div');
                    res.id = `scivi_fsgraph_group_${i}_settings`;
                    res.classList.add('scivi_fsgraph_group_setting');
                    return res;
                })());
                filtersList.appendChild(listItem);
            }
            this._filtersContainer.appendChild(filtersList);
        }
        // HACK: _filtersContainer here will exists anyway
        // @ts-ignore
        this._filtersContainer.id = "scivi_fsgraph_filters_control";

        const parent = $('#scivi_fsgraph_control')[0];
        // @ts-ignore
        parent.appendChild(this._filtersContainer);

        if (filterItemsPresented) {
            this.prevKnownValues.forEach((v, index) => {
                $(`#filter-slider-${index}`).slider('values', v['weight']);
            });
        }
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
