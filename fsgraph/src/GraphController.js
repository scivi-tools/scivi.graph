// @ts-check
import Viva from './viva-proxy'
import { GraphState } from './GraphState'
import { DummyMetrics } from './DummyMetrics'
import { LayoutBuilder } from './LayoutBuilder'
import $ from 'jquery'
/// <reference path="./types/ngraph.types.js" />

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

        this.monitoredValues = ['weight'];
        this._metrics = new DummyMetrics(this.monitoredValues);
        
        this.layoutBuilder = LayoutBuilder.buildLayout(layoutName, this._graph);
        /** @type {NgGenericLayout} */
        this._layoutInstance = this.layoutBuilder.layout;

        
    }

    parseJsonState(state) {
        if (this._currentStateId >= this.states.length) {
            throw new Error("Not enough states in graph controller!");
        }
        let cs = this.states[this._currentStateId];
        if (!cs) {
            cs = new GraphState(this, state.nodes.length, state.edges.length);
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

    /**
     * @returns {NgGraph}
     */
    get graph() {
        return this._graph;
    }

    /** @returns {GraphState} */
    get currentState() {
        return this.states[this._currentStateId];
    }

    /** @returns {number} */
    get currentStateId() {
        return this._currentStateId;
    }

    /** @returns {NgGenericLayout} */
    get layoutInstance() {
        return this._layoutInstance;
    }

    /** @returns {DummyMetrics} */
    get metrics() {
        return this._metrics;
    }

    set currentStateId(value) {
        this.setCurrentStateIdEx(value, null);
    }

    setCurrentStateIdEx(value, renderer) {
        if (value != this._currentStateId) {
            // Сохраняем всевозможную инфу в предыдущем состоянии (те же позиции вершин)
            if ((this._currentStateId >= 0) && (this._currentStateId < this.states.length))
                this.states[this._currentStateId].onBeforeDisabled();

            this._currentStateId = value;

            // здесь мы должны переключать граф путём перезаполнения ngraph.graph
            this.states[this._currentStateId].actualize(renderer);
        }
    }

    static fromJson(json, layoutName) {
        let controller = new GraphController(1, layoutName);

        controller.parseJsonState(json);
        controller._currentStateId = -1;
        return controller;
    }

    static fromStatedJson(json, layoutName) {
        /** @type {any[]} */
        let states = json["states"];
        let controller = new GraphController(states.length, layoutName);

        for (let state in states) {
            controller.parseJsonState(state);
        }
        controller._currentStateId = -1;
        return controller;
    }
}
