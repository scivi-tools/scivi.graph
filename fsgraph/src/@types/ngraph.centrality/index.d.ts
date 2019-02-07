declare interface CentralityResult {
    [_: string]: number;
    [_: number]: number;
}

declare module 'ngraph.centrality' {


    export function betweenness(graph: Ngraph.Graph.Graph, oriented: any): CentralityResult;
    export function closeness(graph: Ngraph.Graph.Graph, oriented: any): CentralityResult;
    export function degree(graph: Ngraph.Graph.Graph, kind: any): CentralityResult;
    export function eccentricity(graph: Ngraph.Graph.Graph, oriented: any): CentralityResult;
}
