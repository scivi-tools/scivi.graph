namespace SciViCGraph
{
    export class IJsonFormat
    {
        nodes: Node[];
        edges: Edge[];
    }

    export class Parser
    {
        private m_nodes: { [id: number]: Node };
        private m_edges: Edge[];
        
        constructor(jsonData: IJsonFormat)
        {
            this.m_nodes = [];
            this.m_edges = [];

            this.processNodes(jsonData.nodes);
            this.processEdges(jsonData.edges);
        }

        private processNodes(nodes: any[])
        {
            nodes.forEach((node) => {
                let g = node.group !== undefined ? node.group : 0;
                let w = node.weight !== undefined ? node.weight : 0;
                let n = node.nmb !== undefined ? node.nmb : 0;
                let d = node.date !== undefined ? new Date(node.date) : null;
                this.m_nodes[node.id] = new Node(node.id, node.label, g, w, n, d);
            });
        }

        private processEdges(edges: any[])
        {
            edges.forEach(edge => {
                let tt = edge.tooltip !== undefined ? edge.tooltip : null;
                this.m_edges.push(new Edge(this.m_nodes[edge.source], this.m_nodes[edge.target], edge.weight, tt));
            });
        }

        get nodes(): Node[]
        {
            let result: Node[] = [];
            for (let key in this.m_nodes) {
                result.push(this.m_nodes[key]);
            }

            return result;
        }

        get edges(): Edge[]
        {
            return this.m_edges;
        }
    }
}
