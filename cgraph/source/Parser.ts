namespace SciViCGraph
{
    export class GraphData
    {
        constructor(public label: string, public nodes: Node[], public edges: Edge[]){}
    };

    export class IJsonFormat
    {
        label: string;
        nodes: any[];
        edges: any[];
    }

    export class IJsonStatesFormat
    {
        states: IJsonFormat[];
    }

    export class Parser
    {
        private m_label: string;
        private m_nodes: { [id: number]: Node };
        private m_edges: Edge[];
        
        constructor(jsonData: IJsonFormat)
        {
            this.m_label = jsonData.label;
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

        get graphData(): GraphData
        {
            let nodes = [];
            for (let key in this.m_nodes)
                nodes.push(this.m_nodes[key]);

            return new GraphData(this.m_label, nodes, this.m_edges);
        }
    }

    export class StatesParser
    {
        private m_states: GraphData[];

        constructor(jsonData: IJsonStatesFormat)
        {
            this.m_states = [];
            jsonData.states.forEach((state) => {
                let parser = new Parser(state);
                this.m_states.push(parser.graphData);
            });
        }

        get graphDataStates(): GraphData[]
        {
            return this.m_states;
        }
    }
}
