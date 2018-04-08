import Viva from './viva-proxy';
import { Node } from './Node'
import { VivaBaseUI } from './VivaBaseUI'

export class VivaNodeUI extends VivaBaseUI {
    constructor(){
        /** @type {Node} */
        this.node = undefined;
    };

    onAddToView(realNode) {
        ;
    };

    onUpdate() {
        ;
    };

    // override
    // Вызывается каждый раз при отображении элемента на интерфейсе
    onPlaceUI() {
        ;
    };
};