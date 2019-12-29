import Viva from '../../viva-proxy';
import {GraphState} from "../../GraphState";
import {Node} from "../../Node";

/**
 * Creates hierarchical layout for a given graph.
 *
 * @param {Ngraph.Graph.Graph} graph which needs to be laid out
 * @param {object} settings if you need custom settings
 */
export default function createLayout(graph, settings) {

    let max_degree = 0;
    /** @type Ngraph.Graph.Node[] */
    let heavyNodes = [];
    /** @type Ngraph.Graph.Node[] */
    let unweightNodes = [];

    graph.forEachNode(n =>
    {
        if (n.links.length > max_degree) {
            heavyNodes.length = 0;
            heavyNodes.push(n);
            max_degree = n.links.length;
        }
        if (n.links.length === max_degree) heavyNodes.push(n);
        if (n.links.length === 0) unweightNodes.push(n);
        return false;
    });

    const initial_radius = settings['maxRadius'];
    const ratio_radius = settings['ratioRadius'];
    let delta_a = 2 * Math.PI / heavyNodes.length;
    let a = 0;
    //расставляем тяжелые вершины
    heavyNodes.forEach(n => {
       n.position = {x: initial_radius * Math.cos(a), y: initial_radius * Math.sin(a)};
       a += delta_a;
    });
    /** @type Ngraph.Graph.Node[] */
    let placedNodes = heavyNodes.slice();
    /** @type Ngraph.Graph.Node[] */
    let node_queue = heavyNodes.slice();
    let radius_queue = [initial_radius, initial_radius];
   // graph.beginUpdate();
    while(node_queue.length !== 0)
    {
        //снимаем первый элемент из очереди
        let center_node = node_queue.shift();
        let r = radius_queue.shift();

        if (placedNodes.indexOf(center_node) !== -1) {
            /** @type Ngraph.Graph.Node[] */
            let non_placed_n_nodes = [];
            //считаем кол-во соседних вершин, которые еще не поставлены
            graph.forEachLinkedNode(center_node.id, (node, link) => {
                if (placedNodes.indexOf(node) === -1)
                    non_placed_n_nodes.push(node);
                return false;
            });
            const delta_alpha = 2 * Math.PI / non_placed_n_nodes.length;
            let alpha = 0;
            //раставляем вершины вокруг центральной
            non_placed_n_nodes.forEach(node =>
            {
                node.position = {x: center_node.position.x + r * Math.cos(alpha), y: center_node.position.y + r * Math.sin(alpha)};
                placedNodes.push(node);
                radius_queue.push(r * ratio_radius);
                node_queue.push(node);
                alpha += delta_alpha;
            });
        }
    }
    //graph.endUpdate();

    let layout = Viva.Layout.constant(graph, settings);

    layout.placeNode(function(node)
    {
        return node.position;
    });



    //включаем возможность перемещения нод
    layout.isNodePinned = function(node){return false;};
    return layout;
}

