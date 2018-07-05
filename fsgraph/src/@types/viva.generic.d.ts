/// <reference path="./ngraph.d.ts" />

declare namespace VivaGeneric {

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

    export interface Program {
        load(glContext: WebGLRenderingContext) : void,
        updateTransform(newTransform: number[]) : void,
        updateSize(w: number, h:number) : void,
        render() : void
    }

    export interface NodeProgram extends Program {
        position(nodeUI: NodeUI, pos: NgraphGraph.Position) : void,
        createNode(ui: NodeUI) : void,
        removeNode(ui: NodeUI) : void,
        replaceProperties(replacedNode: NodeUI, newNode: NodeUI) : void
    }

    export interface LinkProgram extends Program {
        position(nodeUI: LinkUI, fromPos: NgraphGraph.Position, toPos: NgraphGraph.Position) : void,
        createLink(ui: LinkUI) : void,
        removeLink(ui: LinkUI) : void
    }
}
