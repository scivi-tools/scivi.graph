/// <reference path="./ngraph.graph/index.d.ts" />

declare namespace Ngraph {
    namespace Generic {

        export type Rect = {
            x1 : number;
            x2 : number;
            y1 : number;
            y2 : number;
        }

        export interface Layout {
            step() : boolean,
            getNodePosition(id: Graph.ElementId) : Graph.Position,
            setNodePosition(id: Graph.ElementId, x: number, y?: number, z?: number) : void,
            getGraphRect() : Rect,
            getLinkPosition(id: any) : Graph.Position2,
            isNodePinned(node: Graph.Node) : boolean,
            pinNode(node: Graph.Node, pin : boolean) : void,
            lastMove: number
        }
    }
}