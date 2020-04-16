import Viva from '../../viva-proxy';

/**
 * Creates Kamada-Kawai layout for a given graph.
 *
 * @param {Ngraph.Graph.Graph} graph which needs to be laid out
 * @param {object} settings if you need custom settings
 */
export default function createLayout(graph, settings) {
    const W = settings['AreaWidth'];
    const K = settings['SpringCoeff'];
    const eps = settings['Accuracy'];
    const random = require('ngraph.random').random(42);

    //матрица смежности
    var distances = [];
    //матрица идеальных длин
    var lengths = [];
    //матрица жесткостей пружин
    var k = [];

    /** @type Ngraph.Graph.Position */
    var max_dE = {x: 0, y: 0};
    var last_dE = {x: 0, y: 0};
    /** @type Ngraph.Graph.Node */
    var max_dE_node = null;

    init();
    calcMaxDE(max_dE);

    let layout = Viva.Layout.constant(graph, settings);
    layout.placeNode(function(node)
    {
        return graph.getNode(node.id).position;
    });

    layout.step = function(){
        //смещаем ноду пока энергия не станет минимальной
        //while(getVecLength(max_dE) > eps) {
            replaceNode(max_dE_node, max_dE);
        //}
        if (getVecLength(max_dE) < eps)
        {
            calcMaxDE(max_dE);
            getVecLength(max_dE) < eps;
        }
        else return false;
        //перевычисляем максимальный dE

        //alert(max_dE.x + ", " + max_dE.y);
        //return
    };

    //включаем возможность перемещения нод
    layout.isNodePinned = function(node){return false;};
    return layout;

    /** @param {Ngraph.Graph.Position} from
     * @param {Ngraph.Graph.Position} to
     * @returns Number */
    function getPointDistance(from, to)
    {
        return Math.sqrt((to.x - from.x) * (to.x - from.x) + (to.y - from.y) * (to.y - from.y));
    }

    /** @param {Ngraph.Graph.Position} vec
     * @returns Number */
    function getVecLength(vec)
    {
        return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    }

    function init()
    {
        //инициализация матрицы смежности и рандомное начальное расположение вершин
        graph.forEachNode(v => {
            distances[v.id] = [];
            lengths[v.id] = [];
            k[v.id] = [];
            //v.position = {x: random.next(2 * W) - W, y: random.next(2 * W) - W};
            return false;
        });

        //заполняем матрицу смежности
        graph.forEachNode(v => {
            graph.forEachNode(u => {
                const link = graph.getLink(v.id, u.id) || graph.getLink(u.id, v.id);
                distances[v.id][u.id] = distances[u.id][v.id] = (link === undefined || link == null) ? Infinity : 1;
                return !(u.id + 1 < v.id);
            });
            distances[v.id][v.id] = 0;
            return false;
        });

        //Находим кратчайшие растояния в графе(алгоритм Флойда)
        graph.forEachNode(k => {
            graph.forEachNode(v => {
                graph.forEachNode(u => {
                    distances[v.id][u.id] = Math.min(distances[v.id][u.id], distances[v.id][k.id] + distances[k.id][u.id]);
                    return false;
                });
                return false;
            });
            return false;
        });

        var L = 0;
        distances.forEach(node => {
            node.forEach(distance => {
                if (distance > L && distance !== Infinity) L = distance;
            });
        });
        L = W / L;

        //вычисляем массив lengths и k
        graph.forEachNode(v => {
            graph.forEachNode(u => {
                if (v !== u) {
                    lengths[v.id][u.id] = lengths[u.id][v.id] = distances[v.id][u.id] * L;
                    k[v.id][u.id] = k[u.id][v.id] = K / (distances[v.id][u.id] * distances[v.id][u.id]);
                }
                return !(u.id + 1 < v.id);
            });
            return false;
        });
    }

    //O(n^2)
    function calcMaxDE(max_dE) {
        max_dE.x = 0;
        max_dE.y = 0;
        max_dE_node = null;
        var dE = {x: 0, y: 0};
        graph.forEachNode(v => {
                /** @type Ngraph.Graph.Position */
                calcDE(v, dE);
                let dE_norm = getVecLength(dE);
                if (dE_norm > getVecLength(max_dE)) {
                    max_dE.x = dE.x;
                    max_dE.y = dE.y;
                    max_dE_node = v;
                }
            return false;
        });
    }

    //O(n)
    function calcDE(node, dE) {
        dE.x = 0;
        dE.y = 0;
        graph.forEachNode(u => {
            if (node !== u && u.links.length !== 0) {
                const node_pos = node.position;
                const u_pos = u.position;
                const dx = node_pos.x - u_pos.x;
                const dy = node_pos.y - u_pos.y;
                dE.x += k[node.id][u.id] * dx * (1 - lengths[node.id][u.id] / getPointDistance(node_pos, u_pos));
                dE.y += k[node.id][u.id] * dy * (1 - lengths[node.id][u.id] / getPointDistance(node_pos, u_pos));
            }
            return false;
        });
    }

    /** O(n)
     * Смещаем ноду,чтобы уменьшить ее энергию
     * @param {Ngraph.Graph.Node} node
     * @param {Ngraph.Graph.Position} dE
     */
    function replaceNode(node, dE) {
        //---------- вычисляем delta решая ДУ --------------
        let d2E_dx = 0;
        let d2E_dy = 0;
        let d2E_dxy = 0;
        graph.forEachNode(u => {
            if (u !== node && u.links.length !== 0) {
                const node_pos = node.position;
                const u_pos = u.position;
                var distance = getPointDistance(node_pos, u_pos);
                let dy = (node_pos.y - u_pos.y);
                let dx = (node_pos.x - u_pos.x);
                d2E_dx += k[node.id][u.id] * (1 -
                    lengths[node.id][u.id] * dy * dy / distance / distance / distance);
                d2E_dy += k[node.id][u.id] * (1 -
                    lengths[node.id][u.id] * dx * dx / distance / distance / distance);
                d2E_dxy += k[node.id][u.id] * (lengths[node.id][u.id] * dx * dy / distance / distance / distance);
            }
            return false;
        });
        const det = d2E_dx * d2E_dy - d2E_dxy * d2E_dxy;
        let dx = (d2E_dxy * dE.y - d2E_dy * dE.x) / det;
        let dy = (d2E_dxy * dE.x - d2E_dx * dE.y) / det;
        //alert("dx:" + dx + "\ndy:" + dy);
        //--------------------------------------------------
        node.position.x += dx;
        node.position.y += dy;
        calcDE(node, dE);
    }
}

/**
 * @param {Ngraph.Graph.Graph} graph
 * @param {Number} clustersCount
 * @returns [Ngraph.Graph.Node[]]
 */
function uniformClustering(graph, clustersCount)
{

    var clusters = [[]];
    const nodes_in_cluster = graph.getNodesCount() / clustersCount;
    var cluster_index = 0;
    var i = 0;
    var nodes_past = graph.getNodesCount();
    graph.forEachNode(node =>{
        if (i >= nodes_in_cluster && nodes_past > nodes_in_cluster){
            i = 0;
            cluster_index++;
            clusters[cluster_index] = [];
        }
        clusters[cluster_index].push(node);
        i++;
        nodes_past--;
        return false;
    });
    return clusters;
}

/**
 * Круговая укладка кластеров
 * @param {Ngraph.Graph.Graph} graph
 * @param {Object[]} clusters
 * @param {Number} inRadius
 * @param {Number} outRadius
 */
function clusterLayout(graph, clusters, inRadius, outRadius)
{
    graph.beginUpdate();
    const delta_alpha = 2* Math.PI / clusters.length;
    var alpha = 0;
    clusters.forEach(cluster => {
        var pos = {x: outRadius * Math.cos(alpha), y: outRadius * Math.sin(alpha)};
        const delta_a = 2 * Math.PI / cluster.length;
        var a = 0;
        cluster.forEach(node=>{
            node.position = {x: pos.x + inRadius * Math.cos(a), y: pos.y + inRadius * Math.sin(a)};
            a += delta_a;
        });
        alpha += delta_alpha;
    });
    graph.endUpdate();
}




