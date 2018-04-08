// @ts-check
import Viva from './viva-proxy';
import { GraphState } from './GraphState';

export class GraphController {
    constructor(statesCount) {
        /** @type {GraphState[]} */
        this.states = [];
        this.states.length = statesCount;
        this._currentStateId = 0;

        // TODO: добавить возможность отказаться от уникальных индексов связей
        this._graph = Viva.Graph.graph();
        // TODO: эти два должны передаваться через сеттеры, ну и это будут как минимум объекты-обёртки
        this._layout = null;
        this._renderer = null;
    }

    parseJsonState(state) {
        if (this._currentStateId >= this.states.length) {
            throw new Error("Not enough states in graph controller!");
        }
        let cs = this.states[this._currentStateId];
        if (!cs) {
            cs = new GraphState();
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

        this._currentStateId++;
    }

    get currentStateId() {
        return this._currentStateId;
    }

    set currentStateId(value) {
        throw new Error("currentStateId Not implemented!");
        // TODO: здесь мы должны переключать граф путём перезаполнения ngraph.graph
        // при этом предыдущее состояние запоминает всякие позиции вершин...
    }

    static fromJson(json) {
        let controller = new GraphController(1);

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
