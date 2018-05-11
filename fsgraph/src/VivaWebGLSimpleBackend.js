//@ts-check
import Viva from './viva-proxy';
import { VivaBaseUI } from './VivaBaseUI';
import { VivaColoredNodeRenderer } from './VivaMod/VivaColoredNodeRenderer';
import { VivaImageNodeUI } from './VivaImageNodeUI';
import { VivaLinkUI } from './VivaLinkUI';
import { newLinkProgram } from './VivaMod/newLinkProgram';
import { newNodeProgram } from './VivaMod/newNodeProgram';
import { webglGraphics } from './VivaMod/webglGraphics';
import { webglInputEvents } from './VivaMod/webglInputEvents';
import { NodeUIBuilder } from './NodeUIBuilder';

export class VivaWebGLSimpleBackend {
    /**
     * 
     * @param {NodeUIBuilder} nodeUIBuilder 
     */
    constructor(nodeUIBuilder) {
        this._graphics = webglGraphics({
            // явно указываем webgl'ю не чистить backbuffer после свапа
            preserveDrawingBuffer: true,
            // не менее явно указываем виве таки вызывать gl.clear() перед рендером кадра
            // цвет (clearColorValue) оставляем стандартный - белый
            clearColor: true
        });

        /** @type {HTMLElement} */
        this._container = null;

        this._nodeBuilder = nodeUIBuilder;

        /** @type {function(VivaImageNodeUI) : void} */
        this.onRenderNodeCallback = stub;
        /** @type {function(any) : void} */
        this.onRenderEdgeCallback = stub;
    }

    /**
     * TODO: здесь обновляются шейдеры и т.п. для конкретного бакенда
     * Можно сделать этот класс бызовым для них
     * @param {HTMLElement} container
     */
    postInit(container) {
        this._container = container;

        this._graphics.setNodeProgram(new VivaColoredNodeRenderer());
        this._graphics.setLinkProgram(newLinkProgram());

        this._graphics.init(container);

        this._graphics.node((node) => {
            return this._nodeBuilder.buildUI(this._graphics, node);
        });
        this._graphics.link((link) => {
            return new VivaLinkUI(this._graphics, link);
            // HACK: сейчас _graphics пропатчен на то, чтобы самостоятельно запоминать link!
        });

        // Устанавливаем действия при отображении примитивов
        // TODO: задать само действие д.б. можно снаружи этого класса!
        this._graphics.placeLink((/** @type {VivaLinkUI} */linkUI) => this.onRenderEdgeCallback(linkUI));
        this._graphics.placeNode((/** @type {VivaImageNodeUI} */nodeUI) => {
            this.onRenderNodeCallback(nodeUI);
            nodeUI.onRender();
        });
    }

    get graphics() {
        return this._graphics;
    }

    get inputListner() {
        // Пока можно так, ибо всё кешируется в нутрянке
        return webglInputEvents(this._graphics);
    }
}

function stub() {
    ;
}
