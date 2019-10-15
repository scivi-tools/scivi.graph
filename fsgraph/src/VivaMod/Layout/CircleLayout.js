import NgraphGraph from 'ngraph.graph';
import { Node } from '../../Node';

/**
 * Creates Circle layout for a given graph.
 *
 * @param {Ngraph.Graph.Graph} graph which needs to be laid out
 * @param {object} settings if you need custom settings
 */
export default function createLayout(graph, settings) {
 	if (!graph) {
    	throw new Error('Graph structure cannot be undefined');
  	}
  
  	var n = graph.getNode(5);
  	n.label = 'ТЕСТОВАЯ НОДА';
}