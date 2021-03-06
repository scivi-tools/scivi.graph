import { GraphState } from './GraphState';
import { DummyMetrics } from './DummyMetrics';
import { LayoutBuilder } from './LayoutBuilder';
import * as DH from './DataHelpers';
import NgraphGraph from 'ngraph.graph';
import * as $ from 'jquery';
import { AllMetrics } from './GraphMetrics';

export class GraphController {
    /**
     * 
     * @param {number} statesCount
     */
    constructor(statesCount) {
        /** @type {GraphState[]} */
        this.states = [];
        this.states.length = statesCount;
        this._currentStateId = 0;

        // TODO: добавить возможность отказаться от уникальных индексов связей
        this._graph = NgraphGraph();

        this.monitoredValues = ['weight'];
        this._metrics = new DummyMetrics(this.monitoredValues);
        this._edgeMetrics = new DummyMetrics(this.monitoredValues);


        //** @type {Ngraph.Generic.Layout} */
        this.layoutInstance = null;
        //this._layoutBuilder = null;

        /** @type {Function} */
        this._onStateUpdated = null;
        this.graphMetrics = AllMetrics.map(metricConstructor => new metricConstructor(this._graph));
        this.graphMetrics.forEach((v, i) => {
            window[`GraphMetric${i}`] = v.execute.bind(v);
        });
    }

    parseJsonState(state) {
        if (this._currentStateId >= this.states.length) {
            throw new Error("Not enough states in graph controller!");
        }
        let cs = this.states[this._currentStateId];
        if (!cs) {
            cs = new GraphState(this, state.nodes.length, state.edges.length, state.label || '?');
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
        this._edgeMetrics.accumulateMetric(cs._edgeMetrics);
        cs.calcWeightNorms();
        this._currentStateId++;
    }

    /**
     * @returns {Ngraph.Graph.Graph}
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

    /** @returns {DummyMetrics} */
    get metrics() {
        return this._metrics;
    }

    /** @returns {DummyMetrics} */
    get edgeMetrics() {
        return this._edgeMetrics;
    }

    /**
     * @param {number} value
     */
    set currentStateId(value) {
        this.setCurrentStateIdEx(value);
    }

    /**
     * @param {Function} value
     */
    set onStateUpdatedCallback(value) {
        this._onStateUpdated = value;
    }

    /**
     * 
     * @param {number} value
     */
    setCurrentStateIdEx(value) {
        if (value !== this._currentStateId) {
            /** @type {Object.<string, number[]>[]?} */
            let prevFilterValues = null;
            // Сохраняем всевозможную инфу в предыдущем состоянии (те же позиции вершин)
            if ((this._currentStateId >= 0) && (this._currentStateId < this.states.length)) {
                prevFilterValues = this.states[this._currentStateId].onBeforeDisabled();
                this.states[value].syncWithPrevious(this.states[this._currentStateId]);
            }

            this._currentStateId = value;

            // здесь мы должны переключать граф путём перезаполнения ngraph.graph
            this.states[this._currentStateId].actualize(prevFilterValues);
        }
    }

    /**
     * 
     * @param {Object} json
     */
    static fromJson(json) {
        let controller = new GraphController(1);
        controller.parseJsonState(json);
        controller._currentStateId = -1;
        //controller.layoutBuilder = LayoutBuilder.buildLayout(layoutName, controller.graph);
        return controller;
    }

    /**
     * 
     * @param {Object} json
     */
    static fromStatedJson(json) {
        /** @type {Object[]} */
        let states = json["states"];
        let controller = new GraphController(states.length);

        for (let state of states) {
            controller.parseJsonState(state);
        }
        controller._currentStateId = -1;
        //controller.layoutBuilder = LayoutBuilder.buildLayout(layoutName, controller.graph);
        return controller;
    }
}
