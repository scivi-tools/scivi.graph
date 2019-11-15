import Viva from '../../viva-proxy';

/**
 * Creates Circle layout for a given graph.
 *
 * @param {Ngraph.Graph.Graph} graph which needs to be laid out
 * @param {object} settings if you need custom settings
 */
export default function createLayout(graph, settings) {
	const pi = 3.14159265358979323846;
	//считаем на сколько будем смещать угол после установки вершины
	const delta = 2.0 * pi / graph.getNodesCount();
	let alpha = 0.0;

    //раставляем вершины по кругу
	graph.beginUpdate();
	graph.forEachNode(n => {
		n.position = {x: 1500.0 * Math.cos(alpha), y: 1500.0 * Math.sin(alpha)};
		alpha += delta;
		return false;
	});
	graph.endUpdate();

    //создаем постоянную укладку
	let layout = Viva.Layout.constant(graph);
	layout.placeNode(function(node)
	{
		return graph.getNode(node.id).position;
	});

	//включаем возможность перемещения нод
	layout.isNodePinned = function(node){return false;};
  	return layout;
}