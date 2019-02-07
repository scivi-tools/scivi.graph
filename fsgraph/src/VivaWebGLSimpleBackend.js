
import Viva from './viva-proxy';
import { VivaBaseUI } from './VivaBaseUI';
import { VivaColoredNodeRenderer } from './VivaMod/VivaColoredNodeRenderer';
import { VivaRombusNodeRenderer } from './VivaMod/VivaRombusNodeRenderer';
import { VivaTriangleNodeRenderer } from './VivaMod/VivaTriangleNodeRenderer';
import { ProxyGroupNodeRenderer } from './VivaMod/ProxyGroupNodeRenderer';
import { VivaImageNodeUI } from './VivaImageNodeUI';
import { VivaLinkUI } from './VivaLinkUI';
import { newLinkProgram } from './VivaMod/newLinkProgram';
import { VivaWideLinkRenderer } from './VivaMod/VivaWideLinkRenderer';
import { newNodeProgram } from './VivaMod/newNodeProgram';
import { webglGraphics } from './VivaMod/webglGraphics';
import { webglInputEvents } from './VivaMod/webglInputEvents';
import { NodeUIBuilder } from './NodeUIBuilder';
import { Node } from './Node';
import { Edge } from './Edge';

export class VivaWebGLSimpleBackend {
    /**
     * 
     * @param {NodeUIBuilder} nodeUIBuilder 
     */
    constructor(nodeUIBuilder) {
        /** @type {VivaGeneric.WebGlGraphics<VivaImageNodeUI, VivaLinkUI>} */
        this._graphics = webglGraphics({
            // явно указываем webgl'ю не чистить backbuffer после свапа
            preserveDrawingBuffer: true,
            // не менее явно указываем виве таки вызывать gl.clear() перед рендером кадра
            // цвет (clearColorValue) оставляем стандартный - белый
            clearColor: true
        });

        this._nodeBuilder = nodeUIBuilder;

        /** @type {function(VivaImageNodeUI) : void} */
        this.onRenderNodeCallback = stub;
        /** @type {function(any) : void} */
        this.onRenderEdgeCallback = stub;

        /** @type {string[]} */
        this._nodeTypes = [];
    }

    /**
     * TODO: здесь обновляются шейдеры и т.п. для конкретного бакенда
     * Можно сделать этот класс бызовым для них
     * @param {HTMLElement} container
     */
    postInit(container) {
        /** @type {HTMLElement} */
        this._container = container;

        if (this._nodeTypes.length > 0) {
            this._graphics.setNodeProgram(new ProxyGroupNodeRenderer(this._nodeTypes));
        } else {
            this._graphics.setNodeProgram(new VivaColoredNodeRenderer());
        }
        this._graphics.setLinkProgram(new VivaWideLinkRenderer());//(newLinkProgram());

        this._graphics.init(this._container);

        this._graphics.node(node => {
            return this._nodeBuilder.buildUI(this._graphics, node);
        });
        this._graphics.link(link => {
            return new VivaLinkUI(this._graphics, link);
        });

        // Устанавливаем действия при отображении примитивов
        // TODO: задать само действие д.б. можно снаружи этого класса!
        this._graphics.placeLink(linkUI => this.onRenderEdgeCallback(linkUI));
        this._graphics.placeNode(nodeUI => {
            this.onRenderNodeCallback(nodeUI);
            nodeUI.onRender();
        });
    }

    get graphics() {
        return this._graphics;
    }

    /** @returns {VivaGeneric.WebGlInputEvents<VivaImageNodeUI>} */
    get inputListner() {
        // Пока можно так, ибо всё кешируется в нутрянке
        return webglInputEvents(this._graphics);
    }

    /**
     * @param {string[]} value
     */
    set nodeTypes(value) {
        this._nodeTypes = value;
    }
}

function stub() {
    ;
}
