//@ts-check
import { VivaWebGLRenderer } from './VivaWebGLRenderer';
import { VivaImageNodeUI } from './VivaImageNodeUI';

export class NodeUIBuilder {
    /**
     * 
     * @param {VivaWebGLRenderer} renderer 
     */
    constructor(renderer) {
        this._renderer = renderer;

        /** @type {HTMLElement} */
        this._container = renderer._container
        
        // HACK: пока закостылим текстовые метки вершин здесь, дабы в случае чего
        // можно было махнуть бекенд обранто на вивовский
        /** @type {HTMLSpanElement[]} */
        this._labels = [];
    }

    /**
     * @returns {VivaImageNodeUI}
     */
    buildUI(graphics, node) {
        let title = this._ensureLabelExists(node.id);
        const result = new VivaImageNodeUI(graphics, node, title);
        result.showLabel = result.node.data.groupId === 0;
        return result;
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