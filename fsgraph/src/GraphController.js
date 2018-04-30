// @ts-check
import Viva from './viva-proxy';
import { GraphState } from './GraphState';
import { DummyMetrics } from './DummyMetrics'

export class GraphController {
    constructor(statesCount, useForceAtlas2 = false) {
        /** @type {GraphState[]} */
        this.states = [];
        this.states.length = statesCount;
        this._currentStateId = 0;

        // TODO: добавить возможность отказаться от уникальных индексов связей
        this._graph = Viva.Graph.graph();

        this._metrics = new DummyMetrics();
        
        // TODO: этот должен передаваться через сеттеры,
        // ну и это будут как минимум объекты-обёртки
        
        // Запилить нечто вроде layoutBuilder, который будет принимать параметры лэйаута
        // + иметь метод а-ля getInstance(graph), который и будет вызываться здесь
        // TODO: выбросить в рендерер?
        if (!useForceAtlas2)
            this._layoutInstance = Viva.Graph.Layout.forceDirected(this._graph, {
                springLength : 80,
                springCoeff : 0.0008,
                dragCoeff : 0.02,
                gravity : -1.2,
                // theta : 1
            });
        else
            this._layoutInstance = Viva.Graph.Layout.forceAtlas2(this._graph, {
                // barnesHutOptimize : true,
                // adjustSizes : true,
                linLogMode : true,
                // edgeWeightInfluence : 0.5,
                // gravity: 2.0,
                outboundAttractionDistribution : true
            });
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

    static fromJson(json, useForceAtlas2 = false) {
        let controller = new GraphController(1, useForceAtlas2);

        controller.parseJsonState(json);
        controller.currentStateId = 0;
        return controller;
    }

    static fromStatedJson(json) {
        /** @type {any[]} */
        let states = json["states"];
        let controller = new GraphController(states.length);

        for (let state in states) {
            controller.parseJsonState(state);
        }
        controller.currentStateId = 0;
        return controller;
    }
}
