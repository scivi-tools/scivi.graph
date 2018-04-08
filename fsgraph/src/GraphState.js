//@ts-check
import Viva from './viva-proxy';
import { Node } from './Node';
import { Edge } from './Edge';

export class GraphState {
    constructor(nodesCount, edgesCount) {
        // number[][]
        /** @type {number[][]} */
        this.groups = [];
        this.nodes = [];
        this.edges = [];


    };

    addNode(id, groupId, label, weight) {
        // ensure that group alredy exists before pushing to it
        if (!this.groups[groupId]) {
            this.groups[groupId] = []
        }
        this.groups[groupId].push(id);

        const newNode = new Node(id, groupId, label, weight);
        this.nodes[id] = newNode;

        this.restoreNode(newNode);

        // TODO: count some metrics here
    };

    addEdge(fromId, toId, weight) {
        const newEdge = new Edge(fromId, toId);
        this.edges.push(newEdge);

        this.restoreEdge(newEdge);

        // TODO: count some metrics here
    };

    /**
     * 
     * @param {Node} node 
     */
    restoreNode(node) {
        // this._graph.addNode(node.id, {
        //     graphData: newNode
        // });

        // TODO:...
        node.visible = true;
    };

    restoreEdge(edge) {
        // this._graph.addLink(edge.fromId, edge.toId, {
        //     graphData: edge
        // });
    };
};