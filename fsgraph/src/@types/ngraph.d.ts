/// <reference path="./ngraph.events.d.ts" />
/// <reference path="./ngraph.merge.d.ts" />
/// <reference path="./ngraph.graph.d.ts" />

declare namespace NgraphGeneric {

    export type Rect = {
        x1 : number;
        x2 : number;
        y1 : number;
        y2 : number;
    };

    export interface Layout {
        step() : boolean,
        getNodePosition(id: NgraphGraph.ElementId) : NgraphGraph.Position,
        setNodePosition(id: NgraphGraph.ElementId, x : numer, y?: number, z?:number) : void,
        getGraphRect() : Rect,
        getLinkPosition(id: any) : NgraphGraph.Position2,
        isNodePinned(node : NgraphGraph.Node) : boolean,
        pinNode(node : NgraphGraph.Node, pin : boolean) : void,
        lastMove : number
    };

    export interface NodeUI {
        id: number,
        position: NgraphGraph.Position,
        node: NgraphGraph.Node
    }

    export interface LinkUI {
        id: number,
        pos: NgraphGraph.Position2,
        link: NgraphGraph.Link
    }
}
