namespace SciViCGraph
{
    export class GraphData
    {
        private m_shadowNodes;
        private m_shadowEdges;

        constructor(public label: string, public nodes: Node[], public edges: Edge[])
        {
            this.m_shadowNodes = this.nodes;
            this.m_shadowEdges = this.edges;
        }

        private klassIncludes(klasses: number[], klass: number): boolean
        {
            // FIXME: optimize this: sort + bin search. And make the klasses to be numbers. now they are strings
            for (let i = 0, n = klasses.length; i < n; ++i) {
                if (klasses[i] == klass)
                    return true;
            }
            return false;
        }

        public excludeUnselected(selectedKlasses: number[], getKlass: (node: Node) => number)
        {
            this.nodes = [];
            this.m_shadowNodes.forEach((node) => {
                if (this.klassIncludes(selectedKlasses, getKlass(node)))
                    this.nodes.push(node);
            });

            this.edges = [];
            this.m_shadowEdges.forEach((edge) => {
                if (this.klassIncludes(selectedKlasses, getKlass(edge.source)) &&
                    this.klassIncludes(selectedKlasses, getKlass(edge.target)))
                    this.edges.push(edge);
            });
        }
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
                this.m_nodes[node.id] = new Node(node);
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
