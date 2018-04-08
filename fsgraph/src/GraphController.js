import { GraphState } from './GraphState';

export class GraphController {
    constructor(statesCount) {
        this.states = [];
        // TODO: store it in states.length
        this._statesCount = statesCount;
        this.currentStateId = 0;

        this._graph = Viva.Graph.graph();
        this._layout = null;
        this._renderer = null;
    };

    parseJsonState(state) {
        if (this.currentStateId >= this._statesCount) {
            // TODO: throm exception
            return;
        }
        let cs = this.currentState;
        if (!cs) {
            cs = new GraphState();
            this.currentState = cs;
        }
        // ...
        state.nodes.forEach(node => {
            cs.addNode(node.id, node.group, node.label, node.weight);
            // TODO: count max/min weight here
        });

        state.edges.forEach(edge => {
            cs.addEdge(edge.source, edge.target, edge.weight);
        });

        currentStateId++;
    };

    /**
     * @returns {GraphState}
     */
    get currentState() {
        return this.states[currentStateId];
    };

    set currentState(value) {
        this.states[currentStateId] = value;
    }

    static fromJson(json) {
        let controller = new GraphController(1);
        controller.parseJsonState(json);
        controller.currentStateId = 0;
        return controller;
    };
};