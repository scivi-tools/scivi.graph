import { degree, eccentricity } from 'ngraph.centrality';

// TODO: declare interface for metric

export class BaseMetric {
    /**
     * 
     * @param {Ngraph.Graph.Graph} graph
     */
    constructor(graph) {
        this.graph = graph;
    }

    /**
     * @returns {Promise<number>}
     */
    async execute() {
        throw new Error('Abstract method execute() not implemented!');
    }
}

export class DiameterMetric extends BaseMetric {
    constructor(graph) {
        super(graph);
    }

    /**
     * @returns {Promise<number>}
     */
    execute() {
        return new Promise((resolve, reject) => {
            const eccent = eccentricity(this.graph);

            const eccentricityValues = Object.keys(eccent).map(key => eccent[key]);
            const diameter = Math.max(...eccentricityValues);

            console.log(diameter);
            resolve(diameter);
        });
    }
}

export class DegreeMetric extends BaseMetric {
    constructor(graph) {
        super(graph);
    }

    /**
     * @returns {Promise<number>}
     */
    execute() {
        return new Promise((resolve, reject) => {
            const degreees = degree(this.graph);

            const degreeValues = Object.keys(degreees).map(key => degreees[key]);
            const agvDegree = degreeValues.reduce((prev, cur) => prev + cur) / degreeValues.length;

            console.log(agvDegree);
            resolve(agvDegree);
        });
    }
}

/**
 * Assumes graph is directed
 * TODO: should be configurable via UI
 */
export class DensityMetric extends BaseMetric {
    constructor(graph) {
        super(graph);
    }

    /**
     * @returns {Promise<number>}
     */
    execute() {
        return new Promise((resolve, reject) => {
            const nodeCount = this.graph.getNodesCount();
            const linkCount = this.graph.getLinksCount();

            const density = (nodeCount > 1) ? linkCount / (nodeCount * (nodeCount - 1)) : 0;

            console.log(density);
            resolve(density);
        });
    }
}

/** @type {(typeof BaseMetric)[]} */
export const AllMetrics = [DiameterMetric, DegreeMetric, DensityMetric];