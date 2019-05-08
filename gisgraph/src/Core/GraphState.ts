import { Node } from './Node';
import { Metrics } from './Metrics';

export class GraphState {
    constructor(
        private _nodes: Node[],
        public readonly metrics?: Metrics
    ) {
        if (!!metrics) {
            _nodes.forEach(n => metrics.process(n));
        }
    }

    get nodes(): Node[] {
        return this._nodes;
    }
}
