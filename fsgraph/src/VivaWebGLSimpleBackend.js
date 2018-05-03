//@ts-check
import Viva from './viva-proxy';
import { VivaBaseUI } from './VivaBaseUI';
import { VivaImageNodeRenderer } from './VivaMod/VivaImageNodeRenderer';
import { VivaImageNodeUI } from './VivaImageNodeUI';
import { VivaLinkUI } from './VivaLinkUI';
import { newLinkProgram } from './VivaMod/newLinkProgram';
import { newNodeProgram } from './VivaMod/newNodeProgram';
import { webglGraphics } from './VivaMod/webglGraphics';

export class VivaWebGLSimpleBackend {
    constructor() {
        this._graphics = webglGraphics({
            // явно указываем webgl'ю не чистить backbuffer после свапа
            preserveDrawingBuffer: true,
            // не менее явно указываем виве таки вызывать gl.clear() перед рендером кадра
            // цвет (clearColorValue) оставляем стандартный - белый
            clearColor: true
        });

        // HACK: пока закостылим текстовые метки вершин здесь, дабы в случае чего
        // можно было махнуть бекенд обранто на вивовский
        /** @type {HTMLSpanElement[]} */
        this._labels = [];
        /** @type {HTMLElement} */
        this._container = null;

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

        this._graphics.setNodeProgram(newNodeProgram());//new VivaImageNodeRenderer());
        this._graphics.setLinkProgram(newLinkProgram());

        this._graphics.init(container);

        this._graphics.node((node) => {
            let title = this._ensureLabelExists(node.id);
            return new VivaImageNodeUI(this._graphics, node.data, title);
        });
        this._graphics.link((link) => {
            return new VivaLinkUI(this._graphics, link);
        });

        // Устанавливаем действия при отображении примитивов
        // TODO: задать само действие д.б. можно снаружи этого класса!
        this._graphics.placeLink((linkUI) => this.onRenderEdgeCallback(linkUI));
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
        return Viva.Graph.webglInputEvents(this._graphics);
    }

    /**
     * @param {any} id
     */
    _ensureLabelExists(id) {
        if (!this._labels[id]) {
            let label = document.createElement('span');
            label.classList.add('node-label');
            label.innerText = '--insert-text-here--';
            label.hidden = true;
            label.style.opacity = '0.85'
            this._labels[id] = label;
            this._container.appendChild(label);
        }

        return this._labels[id];
    }
}

function stub() {
    ;
}
