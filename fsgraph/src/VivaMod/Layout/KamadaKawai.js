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
    var max_dE;
    /** @type Ngraph.Graph.Node */
    var max_dE_node = null;

    init();
    calcMaxDE();

    let layout = Viva.Layout.constant(graph, settings);
    layout.placeNode(function(node)
    {
        return graph.getNode(node.id).position;
    });

    layout.step = function(){
        //смещаем ноду пока энергия не станет минимальной
        while(getVecLength(max_dE) > eps) {
            max_dE = calcNodePosition(max_dE, max_dE_node);
        }
        //перевычисляем максимальный dE
        calcMaxDE();
        //alert(max_dE.x + ", " + max_dE.y);
        return getVecLength(max_dE) < eps;
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
            v.position = {x: random.next(2 * W) - W, y: random.next(2 * W) - W};
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

    function calcMaxDE() {
        max_dE = {x: 0, y: 0};
        max_dE_node = null;
        graph.forEachNode(v => {
                /** @type Ngraph.Graph.Position */
                var dE = calcDE(v);
                let dE_norm = getVecLength(dE);
                if (dE_norm > getVecLength(max_dE)) {
                    max_dE = dE;
                    max_dE_node = v;
                }
            return false;
        });
    }

    function calcDE(node) {
        var dE = {x: 0,y: 0};
        graph.forEachNode(u => {
            if (node !== u && u.links.length !== 0) {
                const node_pos = node.position;
                const u_pos = u.position;
                const temp_x = node_pos.x - u_pos.x;
                const temp_y = node_pos.y - u_pos.y;
                dE.x += k[node.id][u.id] * temp_x * (1 - lengths[node.id][u.id] / getPointDistance(node_pos, u_pos));
                dE.y += k[node.id][u.id] * temp_y * (1 - lengths[node.id][u.id] / getPointDistance(node_pos, u_pos));
            }
            return false;
        });
        return dE;
    }

    /**
     * Смещаем ноду,чтобы уменьшить ее энергию
     * @param {Ngraph.Graph.Position} dE
     * @param {Ngraph.Graph.Node} node
     */
    function calcNodePosition(dE, node) {
        /** @type Ngraph.Graph.Position */
        let delta = {x: 0, y: 0};
        //---------- вычисляем delta решая ДУ --------------
        let d2E_dx = 0;
        let d2E_dy = 0;
        let d2E_dxy = 0;
        graph.forEachNode(u => {
            if (u !== node && u.links.length !== 0) {
                const node_pos = node.position;
                const u_pos = u.position;
                var distance = getPointDistance(node_pos, u_pos);
                d2E_dx += k[node.id][u.id] * (1 -
                    lengths[node.id][u.id] * Math.pow((node_pos.y - u_pos.y), 2) / Math.pow(distance, 3));
                d2E_dy += k[node.id][u.id] * (1 -
                    lengths[node.id][u.id] * Math.pow((node_pos.x - u_pos.x), 2) / Math.pow(distance, 3));
                d2E_dxy += k[node.id][u.id] * (lengths[node.id][u.id] * (node_pos.x - u_pos.x) * (node_pos.y - u_pos.y) /
                    Math.pow(distance, 3));
            }
            return false;
        });
        const det = d2E_dx * d2E_dy - d2E_dxy * d2E_dxy;
        delta.x = (d2E_dxy * dE.y - d2E_dy * dE.x) / det;
        delta.y = (d2E_dxy * dE.x - d2E_dx * dE.y) / det;
        //--------------------------------------------------
        node.position.x += delta.x;
        node.position.y += delta.y;
        dE = calcDE(node);
        return dE;
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




