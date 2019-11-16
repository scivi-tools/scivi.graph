import Viva from '../../viva-proxy';
import {GraphState} from "../../GraphState";

/**
 * Creates Circle layout for a given graph.
 *
 * @param {Ngraph.Graph.Graph} graph which needs to be laid out
 * @param {object} settings if you need custom settings
 */
export default function createLayout(graph, settings) {
	//TODO: считывать из настроек GraphState
	/** @type {GraphState} */
	const graphState = settings['graphState'];
	const groupsCount = graphState.groups.length;
	const maxRadius = settings['maxRadius'];
	const deltaRadius = maxRadius / groupsCount;
	var radius = maxRadius;
	graph.beginUpdate();
	for (var group of graphState.groups.sort((g1, g2) => {return g2.length - g1.length}))
	{
		const delta = 2.0 * Math.PI / group.length;
		let alpha = 0.0;
		graph.forEachNode(n => {
			if (group.indexOf(n.id, 0) !== -1) {
				n.position = {x: radius * Math.cos(alpha), y: radius * Math.sin(alpha)};
				alpha += delta;
			}
			return false;
		});
		radius -= deltaRadius;
	}
	graph.endUpdate();





	let layout = Viva.Layout.constant(graph);
	layout.placeNode(function(node)
	{
		return graph.getNode(node.id).position;
	});

	//включаем возможность перемещения нод
	layout.isNodePinned = function(node){return false;};
  	return layout;
}