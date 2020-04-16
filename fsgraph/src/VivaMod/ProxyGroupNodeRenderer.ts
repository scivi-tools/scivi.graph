import { VivaColoredNodeRenderer } from './VivaColoredNodeRenderer';
import { VivaRombusNodeRenderer } from './VivaRombusNodeRenderer';
import {ATTRIBUTES_PER_PRIMITIVE, VivaTriangleNodeRenderer} from './VivaTriangleNodeRenderer';
import * as WGLU from "./WebGLUtils";

interface HookedNodeUI extends VivaGeneric.NodeUI {
    __id_hooked?: boolean;
    __id_per_group: number;
}

export const RENDERER_MAP: { [_: string]: { new(_: number): VivaGeneric.NodeProgram } } = {
    'circle': VivaColoredNodeRenderer,
    'romb': VivaRombusNodeRenderer,
    'triang': VivaTriangleNodeRenderer
};

export class ProxyGroupNodeRenderer implements VivaGeneric.NodeProgram {

    private _renderers: VivaGeneric.NodeProgram[];
    private _nodeListPerGroup: (HookedNodeUI[])[] = [];
    private _context: WebGLRenderingContext = null;
    private _w = 0;
    private _h = 0;
    private _transform: number[] = [];

    constructor(rendererList: string[]) {
        this._renderers = rendererList.map((v, i, _) => new RENDERER_MAP[v](64));
        // ща пойдут костыли космического масштаба
        // Проблема: разделяя вершины по группам, становится невозможно представлять их в виде непрерывных массивов, поскольку появляются дыры в нумерации
        // Решение: хранить внутри каждой вершины её ид внутри группы, подменять реальный ид на него и обратно при вызове любых функций
        for (let i = 0; i < this._renderers.length; i++) {
            this._nodeListPerGroup[i] = [];
        }
    }

    private _hookID(nodeUI: HookedNodeUI) {
        if (!!nodeUI.__id_hooked) {
            throw new Error('Trying to hook nodeUI id twice!');
        }
        const groupId: number = nodeUI.node.data.groupId;

        nodeUI.__id_per_group = this._nodeListPerGroup[groupId].length;
        nodeUI.__id_hooked = true;

        this._nodeListPerGroup[groupId].push(nodeUI);

        return this._replaceID(nodeUI);
    }

    private _replaceID(nodeUI: HookedNodeUI) {
        const oldID = nodeUI.id;
        nodeUI.id = nodeUI.__id_per_group;
        return oldID;
    }

    changeNodeType(nodeType: string, idx: number) {
        const newProgram: VivaGeneric.NodeProgram = new RENDERER_MAP[nodeType](64);
        const oldProgram = this._renderers[idx];

        // copy properties (nuts way)
        newProgram.load(this._context);
        newProgram.updateTransform(this._transform);
        newProgram.updateSize(this._w, this._h);

        // like-a-copy nodes from prev renderer into new one
        oldProgram.position = (ui, pos) => {
            newProgram.createNode(ui);
            newProgram.position(ui, pos);
        }

        // then replace old renderer by new;
        // without modifying webglGraphics
        const that = this;
        oldProgram.render = () => {
            that._renderers[idx] = newProgram;
            newProgram.render();
        };
    }

    // #region VivaAPI

    load(glContext: WebGLRenderingContext) {
        for (let renderer of this._renderers) {
            renderer.load(glContext);
        }
        this._context = glContext;
    }

    position(nodeUI: VivaGeneric.NodeUI, pos: Ngraph.Graph.Position) {
        const oldID = this._replaceID(nodeUI as HookedNodeUI);
        this._renderers[nodeUI.node.data.groupId].position(nodeUI, pos);
        nodeUI.id = oldID;
    }

    createNode(nodeUI: VivaGeneric.NodeUI) {
        const oldID = this._hookID(nodeUI as HookedNodeUI);
        this._renderers[nodeUI.node.data.groupId].createNode(nodeUI);
        nodeUI.id = oldID;
    }

    removeNode(nodeUI: VivaGeneric.NodeUI) {
        const oldID = this._replaceID(nodeUI as HookedNodeUI);
        this._renderers[nodeUI.node.data.groupId].removeNode(nodeUI);
        
        // HACK: a bit of replaceProperties logic
        const nodeGroup = this._nodeListPerGroup[nodeUI.node.data.groupId];
        // kinda splice
        for (let i = nodeUI.id; i < nodeGroup.length - 1; i++) {
            nodeGroup[i] = nodeGroup[i + 1];
            nodeGroup[i].__id_per_group = i;
        }
        nodeGroup.length--;

        nodeUI.id = oldID;
    }

    replaceProperties(_replacedNode: VivaGeneric.NodeUI, _newNode: VivaGeneric.NodeUI) {
        // not implemented
    }

    updateTransform(newTransform: number[]) {
        for (let renderer of this._renderers) {
            renderer.updateTransform(newTransform);
        }
        this._transform = newTransform;
    }

    updateSize(w: number, h: number) {
        for (let renderer of this._renderers) {
            renderer.updateSize(w, h);
        }
        this._w = w;
        this._h = h;
    }

    render() {
        for (let renderer of this._renderers) {
            renderer.render();
        }
    }

    bringToFront(node) {
        this._renderers[node.node.data.groupId].bringToFront(node);
    }

    getFrontNodeId(groupId) {
        return this._renderers[groupId].getFrontNodeId(groupId);
    }

    // #endregion
}
