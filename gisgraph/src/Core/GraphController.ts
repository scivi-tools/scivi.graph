import { GraphState } from "./GraphState";

export class GraphController {

    private currentStateIdx = 0;
    constructor(
        private readonly _states: GraphState[]
    ) {
        if (!_states || !_states.length) {
            throw new Error('Invalid states array!');
        }
    }

    get currentState(): GraphState {
        return this._states[this.currentStateIdx];
    }
}