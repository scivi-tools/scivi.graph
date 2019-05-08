import { Node } from './Node';

export class Metrics {
    public readonly monitoredValues: {
        [v: string]: {
            min?: number,
            max?: number
        }
    };
    constructor(
        private monitoredFields: string[]
    ) {
        this.monitoredValues = Object.create(null);
        this.monitoredFields.forEach(v => this.monitoredValues[v] = {});
    }

    process(node: Node) {
        this.monitoredFields
            .filter(v => Object.keys(node).indexOf(v) >= 0)
            .forEach(v => {
                // @ts-ignore
                const value = node[v];
                this.monitoredValues[v].min = (this.monitoredValues[v].min !== undefined) ? Math.min(this.monitoredValues[v].min!, value) : value;
                this.monitoredValues[v].max = (this.monitoredValues[v].max !== undefined) ? Math.max(this.monitoredValues[v].max!, value) : value;
            });
    }
}
