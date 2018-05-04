// @ts-check
import Viva from './viva-proxy'
import { GraphState } from './GraphState'
import { DummyMetrics } from './DummyMetrics'
import { LayoutBuilder } from './LayoutBuilder'

export class GraphController {
    /**
     * 
     * @param {number} statesCount 
     * @param {string} layoutName 
     */
    constructor(statesCount, layoutName) {
        /** @type {GraphState[]} */
        this.states = [];
        this.states.length = statesCount;
        this._currentStateId = 0;

        // TODO: добавить возможность отказаться от уникальных индексов связей
        this._graph = Viva.Graph.graph();

        this._metrics = new DummyMetrics();
        
        this._layoutInstance = LayoutBuilder.buildLayout(layoutName, this._graph);
    }

    parseJsonState(state) {
        if (this._currentStateId >= this.states.length) {
            throw new Error("Not enough states in graph controller!");
        }
        let cs = this.states[this._currentStateId];
        if (!cs) {
            cs = new GraphState(state.nodes.length, state.edges.length);
            this.states[this._currentStateId] = cs;
        }
        // ...
        state.nodes.forEach(node => {
            cs.addNode(node.id, node.group, node.label, node.weight);
            // TODO: count max/min weight here
        });

        state.edges.forEach(edge => {
            cs.addEdge(edge.source, edge.target, edge.weight);
        });

        // TODO: тут тоже геттеры нужны
        this._metrics.accumulateMetric(cs._metrics);

        this._currentStateId++;
    }

    get currentStateId() {
        return this._currentStateId;
    }

    get layoutInstance() {
        return this._layoutInstance;
    }

    get metrics() {
        return this._metrics;
    }

    set currentStateId(value) {
        if (value != this._currentStateId) {
            // Сохраняем всевозможную инфу в предыдущем состоянии (те же позиции вершин)
            if (this._currentStateId < this.states.length)
                this.states[this._currentStateId].onBeforeDisabled(this._graph, this._layoutInstance);

            this._currentStateId = value;

            // здесь мы должны переключать граф путём перезаполнения ngraph.graph
            this.states[this._currentStateId].actualize(this._graph, this._layoutInstance);
        }
    }

    static fromJson(json, layoutName) {
        let controller = new GraphController(1, layoutName);

        controller.parseJsonState(json);
        controller.currentStateId = 0;
        return controller;
    }

    static fromStatedJson(json, layoutName) {
        /** @type {any[]} */
        let states = json["states"];
        let controller = new GraphController(states.length, layoutName);

        for (let state in states) {
            controller.parseJsonState(state);
        }
        controller.currentStateId = 0;
        return controller;
    }
}
