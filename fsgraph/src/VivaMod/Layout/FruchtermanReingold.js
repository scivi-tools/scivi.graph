import Viva from '../../viva-proxy';

/**
 * @param {Ngraph.Graph.Graph} graph
 * @param {object} options
 */
export default function createLayout(graph, options) {
    const width = options['AreaWidth'];
    const height = options['AreaHeight'];
    const area = width * height;
    const k = options['OptimalDistanceCoeff'] * Math.sqrt(area / graph.getNodesCount());
    const random = require('ngraph.random').random(42);
    const cooling = options['CoolingCoeff'];
    const eps = options['Accuracy'];

    /** @type {Ngraph.Graph.Position[]} */
    let displacements = []; //dx для каждой вершины
    graph.forEachNode(node => {
        displacements[node.id] = {x: 0, y: 0};
        //node.position = {x: random.next(2 * width) - width, y : random.next(2 * height) - height};
        return false;
    });
    let temperature = options['InitialTemperatureCoeff'] * Math.sqrt(graph.getNodesCount());

    const layout = Viva.Layout.constant(graph, options);
    layout.placeNode(function(node)
    {
        return graph.getNode(node.id).position;
    });
    layout.step = function(){
        calcRepulsiveForces();
        calcAttractiveForces();
        graph.forEachNode(v =>{
            const disp = displacements[v.id];
            const disp_norm = Math.sqrt(disp.x * disp.x + disp.y* disp.y);
            if (disp_norm < 1) return false;
            v.position.x += disp.x / disp_norm * Math.min(disp_norm, temperature);
            v.position.y += disp.y / disp_norm * Math.min(disp_norm, temperature);
            return false;
        });
        temperature *= cooling;
        return temperature < eps;
    };

    //включаем возможность перемещения нод
    layout.isNodePinned = function(node){return false;};
    return layout;

    function force_attractive(d){
        return d * d / k;
    }

    function force_repulsive(d){
        return k * k / d;
    }

    function calcAttractiveForces(){
        /*
        for e in E do begin
        { each edge is an ordered pair of vertices .v and .u }
            ∆ := e.v.pos – e.u.pos
            e.v.disp := e.v.disp – ( ∆/| ∆ |) * fa (| ∆ |);
            e.u. disp := e.u.disp + ( ∆ /| ∆ |) * fa (| ∆ |)
        end
         */
        graph.forEachLink(link => {
           const v = graph.getNode(link.fromId);
           const u = graph.getNode(link.toId);
            let dx = v.position.x - u.position.x;
            let dy = v.position.y - u.position.y;
            let delta_norm = Math.sqrt(dx * dx + dy * dy);

            if (delta_norm === 0) {
                dx = (random.nextDouble() - 0.5) / 50;
                dy = (random.nextDouble() - 0.5) / 50;
                delta_norm = Math.sqrt(dx * dx + dy * dy);
            }
            const attraction = force_attractive(delta_norm);
            displacements[v.id].x -= (dx / delta_norm) * attraction;
            displacements[v.id].y -= (dy / delta_norm) * attraction;
            displacements[u.id].x += (dx / delta_norm) * attraction;
            displacements[u.id].y += (dy / delta_norm) * attraction;
            return false;
        });
    }

    function calcRepulsiveForces(){
        /*for v in V do
          begin
             { each vertex has two vectors: .pos and .disp }
              v.disp := 0;
              for u in V do
              if (u # v) then begin
                  { ∆ is short hand for the difference}
                  { vector between the positions of the two vertices )
                  ∆ := v.pos - u.pos;
                  v.disp := v.disp + ( ∆ /| ∆ |) * fr (| ∆ |)
              end
          end */
        graph.forEachNode(v => {
            displacements[v.id] = {x: 0, y: 0};
            graph.forEachNode(u => {
                if (v !== u) {
                    let dx = v.position.x - u.position.x;
                    let dy = v.position.y - u.position.y;
                    let delta_norm = Math.sqrt(dx * dx + dy * dy);
                    if (delta_norm === 0) {
                        dx = (random.nextDouble() - 0.5) / 50;
                        dy = (random.nextDouble() - 0.5) / 50;
                        delta_norm = Math.sqrt(dx * dx + dy * dy);
                    }
                    if (delta_norm > 1000) return !(u.id + 1 < v.id);
                    const repulsion = force_repulsive(delta_norm);
                    displacements[v.id].x += dx / delta_norm * repulsion;
                    displacements[v.id].y += dy / delta_norm * repulsion;
                    displacements[u.id].x -= dx / delta_norm * repulsion;
                    displacements[u.id].y -= dy / delta_norm * repulsion;
                }
                return !(u.id + 1 < v.id);
            });
            return false;
        });
    }
}


