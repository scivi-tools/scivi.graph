//@ts-check
import Viva from './viva-proxy';

export class VivaWebGLSimpleBackend {
    constructor() {
        this._graphics = Viva.Graph.View.webglGraphics({
            // явно указываем webgl'ю не чистить backbuffer после свапа
            preserveDrawingBuffer: true,
            // не менее явно указываем виве таки вызывать gl.clear() перед рендером кадра
            // цвет (clearColorValue) оставляем стандартный - белый
            clearColor: true
        });
        this._inputListner = Viva.Graph.webglInputEvents(this._graphics);
    }

    /**
     * TODO: здесь обновляются шейдеры и т.п. для конкретного бакенда
     * Можно сделать этот класс бызовым для них
     */
    postInit() {
        

        this._graphics.node((node) => {
            return Viva.Graph.View.webglSquare(10, 0xccccb3ff);
        });
        // HACK: обходим косяк в бэкенде,
        // связанный с недобавлением ссылки на модель ребра в её представление
        this._graphics.link((link) => {
            var res = Viva.Graph.View.webglLine(0xb3b3b3ff);
            res.link = link;
            return res;
        });
    }

    get graphics() {
        return this._graphics;
    }
}