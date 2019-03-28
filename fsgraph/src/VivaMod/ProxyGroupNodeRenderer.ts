import { VivaColoredNodeRenderer } from './VivaColoredNodeRenderer';
import { VivaRombusNodeRenderer } from './VivaRombusNodeRenderer';
import { VivaTriangleNodeRenderer } from './VivaTriangleNodeRenderer';

export const RENDERER_MAP: { [_: string]: {new (_: number): VivaGeneric.NodeProgram} } = {
    'circle': VivaColoredNodeRenderer,
    'romb': VivaRombusNodeRenderer,
    'triang': VivaTriangleNodeRenderer
};

export class ProxyGroupNodeRenderer implements VivaGeneric.NodeProgram {

    private _renderers: VivaGeneric.NodeProgram[];
    private _nodeCountPerGroup: Uint32Array;
    private _lastInsertedNode: VivaGeneric.NodeUI[];
    private _context: WebGLRenderingContext = null;
    private _w = 0;
    private _h = 0;
    private _transform: number[] = [];

    constructor(rendererList: string[]) {
        this._renderers = rendererList.map((v, i, _) => new RENDERER_MAP[v](64));

        // ща пойдут костыли космического масштаба
        // Проблема: разделяя вершины по группам, становится невозможно представлять их в виде непрерывных массивов, поскольку появляются дыры в нумерации
        // Решение: хранить внутри каждой вершины её ид внутри группы, подменять реальный ид на него и обратно при вызове любых функций
        this._nodeCountPerGroup = new Uint32Array(this._renderers.length);

        this._lastInsertedNode = new Array(this._renderers.length);
    }

    private _hookID(nodeUI) {

        if (nodeUI['__id_hooked']) {
            throw new Error('Trying to hook nodeUI id twice!');
        }

        nodeUI['__id_per_group'] = this._nodeCountPerGroup[nodeUI.node.data.groupId];
        this._nodeCountPerGroup[nodeUI.node.data.groupId]++;

        nodeUI['__id_hooked'] = true;

        this._lastInsertedNode[nodeUI.node.data.groupId] = nodeUI;

        return this._replaceID(nodeUI);
    }

    private _replaceID(nodeUI) {
        let oldID = nodeUI.id;

        nodeUI.id = nodeUI['__id_per_group'];
        return oldID;
    }

    changeNodeType(nodeType: string, idx: number) {
        const newProgram: VivaGeneric.NodeProgram  = new RENDERER_MAP[nodeType](64);
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
        const oldID = this._replaceID(nodeUI);
        this._renderers[nodeUI.node.data.groupId].position(nodeUI, pos);
        nodeUI.id = oldID;
    }

    createNode(nodeUI: VivaGeneric.NodeUI) {
        const oldID = this._hookID(nodeUI);
        this._renderers[nodeUI.node.data.groupId].createNode(nodeUI);
        nodeUI.id = oldID;
    }

    removeNode(nodeUI: VivaGeneric.NodeUI) {
        const oldID = this._replaceID(nodeUI);
        this._renderers[nodeUI.node.data.groupId].removeNode(nodeUI);
        nodeUI.id = oldID;
        this._nodeCountPerGroup[nodeUI.node.data.groupId]--;
    }

    replaceProperties(replacedNode: VivaGeneric.NodeUI, newNode: VivaGeneric.NodeUI) {
        if (replacedNode.node.data.groupId !== newNode.node.data.groupId) {
            let lastNode = this._lastInsertedNode[replacedNode.node.data.groupId];
            if (lastNode) {
                lastNode['__id_per_group'] = replacedNode['__id_per_group'];
            }
        } else {
            newNode['__id_per_group'] = replacedNode['__id_per_group'];
        }
        // not implemented
        // this._renderers[replacedNode.node.data.groupId].replaceProperties(replacedNode, newNode);
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

    // #endregion
}
