// @ts-check
import Viva from './viva-proxy';
import { GraphState } from './GraphState';
import { DummyMetrics } from './DummyMetrics';
import { LayoutBuilder } from './LayoutBuilder';
import * as DH from './DataHelpers';
import * as $ from 'jquery';
/// <reference path="./@types/ngraph.d.ts" />

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
        /** @type {NgraphGeneric.Layout} */
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
            let id = DH.getValue(node, 'id', 'number');
            let groupId = DH.getValueDef(node, 'group', 'number', 0);
            cs.addNode(id, groupId, node);
        });

        state.edges.forEach(edge => {
            let sid = DH.getValue(edge, 'source', 'number');
            let tid = DH.getValue(edge, 'target', 'number');
            cs.addEdge(sid, tid, edge);
        });

        // TODO: тут тоже геттеры нужны
        this._metrics.accumulateMetric(cs._metrics);

        this._currentStateId++;
    }

    /**
     * @returns {NgraphGraph.Graph}
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

    /** @returns {NgraphGeneric.Layout} */
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
            if ((this._currentStateId >= 0) && (this._currentStateId < this.states.length)) {
                this.states[this._currentStateId].onBeforeDisabled();
                this.states[value].syncWithPrevious(this.states[this._currentStateId]);
            }

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
        /** @type {Object[]} */
        let states = json["states"];
        let controller = new GraphController(states.length, layoutName);

        for (let state of states) {
            controller.parseJsonState(state);
        }
        controller._currentStateId = -1;
        return controller;
    }
}
