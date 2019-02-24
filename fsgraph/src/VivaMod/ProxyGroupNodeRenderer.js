
import { VivaColoredNodeRenderer } from './VivaColoredNodeRenderer';
import { VivaRombusNodeRenderer } from './VivaRombusNodeRenderer';
import { VivaTriangleNodeRenderer } from './VivaTriangleNodeRenderer';

/* @type {Object.<string, VivaGeneric.NodeProgram>} */
export const RENDERER_MAP = {
    'circle': VivaColoredNodeRenderer,
    'romb': VivaRombusNodeRenderer,
    'triang': VivaTriangleNodeRenderer
};

export class ProxyGroupNodeRenderer {
    /**
     * 
     * @param {string[]} rendererList 
     */
    constructor(rendererList) {
        /** @type {VivaGeneric.NodeProgram[]} */
        this._renderers = rendererList.map((v, i, _) => new RENDERER_MAP[v](64));

        // ща пойдут костыли космического масштаба
        // Проблема: разделяя вершины по группам, становится невозможно представлять их в виде непрерывных массивов, поскольку появляются дыры в нумерации
        // Решение: хранить внутри каждой вершины её ид внутри группы, подменять реальный ид на него и обратно при вызове любых функций
        this._nodeCountPerGroup = new Uint32Array(this._renderers.length);

        /** @type {VivaGeneric.NodeUI[]} */
        this._lastInsertedNode = new Array(this._renderers.length);

        // TODO: workaround assert if interface is implemented
        // https://github.com/Microsoft/TypeScript/issues/17498#issuecomment-399439654   
        /** @type {VivaGeneric.NodeProgram} */
        const assertion = this;
    }

    _hookID(nodeUI) {
        
        if (nodeUI['__id_hooked']) {
            throw new Error('Trying to hook nodeUI id twice!');
        }

        nodeUI['__id_per_group'] = this._nodeCountPerGroup[nodeUI.node.data.groupId];
        this._nodeCountPerGroup[nodeUI.node.data.groupId]++;
        
        nodeUI['__id_hooked'] = true;

        this._lastInsertedNode[nodeUI.node.data.groupId] = nodeUI;

        return this._replaceID(nodeUI);
    }

    _replaceID(nodeUI) {
        let oldID = nodeUI.id;

        nodeUI.id = nodeUI['__id_per_group'];
        return oldID;
    }

    // #region VivaAPI

    load(glContext) {
        for (let renderer of this._renderers) {
            renderer.load(glContext);
        }
    }

    position(nodeUI, pos) {
        const oldID = this._replaceID(nodeUI);
        this._renderers[nodeUI.node.data.groupId].position(nodeUI, pos);
        nodeUI.id = oldID;
    }

    createNode(nodeUI) {
        const oldID = this._hookID(nodeUI);
        this._renderers[nodeUI.node.data.groupId].createNode(nodeUI);
        nodeUI.id = oldID;
    }
  
    removeNode(nodeUI) {
        const oldID = this._replaceID(nodeUI);
        this._renderers[nodeUI.node.data.groupId].removeNode(nodeUI);
        nodeUI.id = oldID;
        this._nodeCountPerGroup[nodeUI.node.data.groupId]--;
    }
  
    replaceProperties(replacedNode, newNode) {
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
  
    updateTransform(newTransform) {
        for (let renderer of this._renderers) {
            renderer.updateTransform(newTransform);
        }
    }
  
    updateSize(w, h) {
        for (let renderer of this._renderers) {
            renderer.updateSize(w, h);
        }
    }
  
    render() {
        for (let renderer of this._renderers) {
            renderer.render();
        }
    }
    
    // #endregion
}
