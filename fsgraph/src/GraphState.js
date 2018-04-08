//@ts-nocheck
import Viva from './viva-proxy';
import { Node } from './Node';
import { Edge } from './Edge';

export class GraphState {
    constructor(nodesCount, edgesCount) {
        // number[][]
        this.groups = [];
        this.nodes = [];
        this.edges = [];

        
    };

    addNode(id, groupId, label, weight) {
        // TODO: ensure that exact group alredy created before pushing to it
        this.groups[groupId].push(id);

        const newNode = new Node(id, groupId, label, weight);
        this.nodes[id] = newNode;

        restoreNode(newNode);

        // TODO: count some metrics here
    };

    addEdge(fromId, toId, weight) {
        const newEdge = new Edge(fromId, toId);
        this.edges.push(newEdge);

        restoreEdge(newEdge);

        // TODO: count some metrics here
    };

    /**
     * 
     * @param {Node} node 
     */
    restoreNode(node) {
        this._graph.addNode(node.id, {
            graphData: newNode
        });

        // TODO:...
        node.visible = true;
    };

    restoreEdge(edge) {
        this._graph.addLink(edge.fromId, edge.toId, {
            graphData: edge
        });
    };

    get graphContainer() {
        return this._graph;
    };
};