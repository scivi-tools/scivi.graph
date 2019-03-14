import { Node } from "./Node";

export class GraphState {
    constructor(
        private _nodes: Node[]
    ) {
        ;
    }

    get nodes(): Node[] {
        return this._nodes;
    }
}