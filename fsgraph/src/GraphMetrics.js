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
     * @returns {void}
     */
    execute() {
        throw new Error('Abstract method execute() not implemented!');
    }
}

export class DiameterMetric extends BaseMetric {
    constructor(graph) {
        super(graph);
    }

    execute() {
        const eccent = eccentricity(this.graph);

        const eccentricityValues = Object.keys(eccent).map(key => eccent[key]);
        const diameter = Math.max(...eccentricityValues);

        console.log(diameter);
    }
}

export class DegreeMetric extends BaseMetric {
    constructor(graph) {
        super(graph);
    }

    execute() {
        const degreees = degree(this.graph);

        const degreeValues = Object.keys(degreees).map(key => degreees[key]);
        const agvDegree = degreeValues.reduce((prev, cur) => prev + cur) / degreeValues.length;
        
        console.log(agvDegree);
    }
}

export const AllMetrics = [DiameterMetric, DegreeMetric];