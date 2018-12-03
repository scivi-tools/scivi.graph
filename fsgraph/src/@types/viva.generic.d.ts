/// <reference path="./ngraph.generic.d.ts" />

declare namespace VivaGeneric {

    export interface NodeUI {
        id: number,
        position: Ngraph.Graph.Position,
        node: Ngraph.Graph.Node
    }

    export interface LinkUI {
        id: number,
        pos: Ngraph.Graph.Position2,
        link: Ngraph.Graph.Link
    }

    export interface Program {
        load(glContext: WebGLRenderingContext) : void,
        updateTransform(newTransform: number[]) : void,
        updateSize(w: number, h:number) : void,
        render() : void
    }

    export interface NodeProgram extends Program {
        position(nodeUI: NodeUI, pos: Ngraph.Graph.Position) : void,
        createNode(ui: NodeUI) : void,
        removeNode(ui: NodeUI) : void,
        replaceProperties(replacedNode: NodeUI, newNode: NodeUI) : void
    }

    export interface LinkProgram extends Program {
        position(nodeUI: LinkUI, fromPos: Ngraph.Graph.Position, toPos: Ngraph.Graph.Position) : void,
        createLink(ui: LinkUI) : void,
        removeLink(ui: LinkUI) : void
    }
}
