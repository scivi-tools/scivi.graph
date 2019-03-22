namespace SciViCGraph
{
    export class GraphStates
    {
        public stateLines: string[][];
        public data: {};
        public dynaminSource: IJsonDynamicSourceFormat;

        constructor()
        {
            this.stateLines = [];
            this.data = {};
            this.dynaminSource = undefined;
        }

        get hasStates(): boolean
        {
            return this.stateLines.length > 0;
        }

        get isDynamic(): boolean
        {
            return this.dynaminSource !== undefined;
        }
    }

    export class GraphData
    {
        private m_shadowNodes;
        private m_shadowEdges;

        constructor(public nodes: Node[], public edges: Edge[])
        {
            this.m_shadowNodes = this.nodes;
            this.m_shadowEdges = this.edges;
        }

        public excludeUnselected(selectedKlasses: number[], getKlass: (node: Node) => number)
        {
            this.nodes = [];
            this.m_shadowNodes.forEach((node) => {
                if (Geometry.sortedArrayIncludesValue(selectedKlasses, getKlass(node)))
                    this.nodes.push(node);
            });

            this.edges = [];
            this.m_shadowEdges.forEach((edge) => {
                if (Geometry.sortedArrayIncludesValue(selectedKlasses, getKlass(edge.source)) &&
                    Geometry.sortedArrayIncludesValue(selectedKlasses, getKlass(edge.target)))
                    this.edges.push(edge);
            });
        }
    }

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

    export class IJsonStatesHierarchyFormat
    {
        stateLines: string[][];
        states: {};
    }

    export class IJsonDynamicSourceFormat
    {
        stateLines: string[][];
        stateGetter: (stateLine: string) => IJsonFormat;
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

            return new GraphData(nodes, this.m_edges);
        }

        get graphStates(): GraphStates
        {
            let result = new GraphStates();
            result.data["0"] = this.graphData;
            return result;
        }
    }

    export class StatesParser
    {
        private m_states: GraphStates;

        constructor(jsonData: IJsonStatesFormat)
        {
            this.m_states = new GraphStates();
            this.m_states.stateLines.push([]);
            jsonData.states.forEach((state, index) => {
                let parser = new Parser(state);
                this.m_states.stateLines[0].push(state.label);
                this.m_states.data[index.toString()] = parser.graphData;
            });
        }

        get graphStates(): GraphStates
        {
            return this.m_states;
        }
    }

    export class HierarchicalStatesParser
    {
        private m_states: GraphStates;

        constructor(jsonData: IJsonStatesHierarchyFormat)
        {
            this.m_states = new GraphStates();
            this.m_states.stateLines = jsonData.stateLines;
            for (let key in jsonData.states) {
                if (jsonData.states.hasOwnProperty(key)) {
                    let parser = new Parser(jsonData.states[key]);
                    this.m_states.data[key] = parser.graphData;
                }
            }
        }

        get graphStates(): GraphStates
        {
            return this.m_states;
        }
    }

    export class DynamicStatesParser
    {
        private m_states: GraphStates;

        constructor(jsonData: IJsonDynamicSourceFormat)
        {
            this.m_states = new GraphStates();
            this.m_states.stateLines = jsonData.stateLines;
            this.m_states.dynaminSource = jsonData;
        }

        get graphStates(): GraphStates
        {
            return this.m_states;
        }
    }
}
