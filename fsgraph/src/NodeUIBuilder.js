//@ts-check
import { VivaWebGLRenderer } from './VivaWebGLRenderer';
import { VivaImageNodeUI } from './VivaImageNodeUI';
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';

const _FontSizeDiap = [10, 36];

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

        this._fontSize = 16;

        this._buildUi();
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
     * @param {number} value
     */
    set fontSize(value) {
        this._fontSize = value;
        let fontString = this.fontSizeString;
        for (let label of this._labels) {
            if (label) {
                label.style.fontSize = fontString;
            }
        }
    }

    get fontSizeString() {
        return `${this._fontSize}px`;
    }

    /**
     * @param {any} id
     */
    _ensureLabelExists(id) {
        if (!this._labels[id]) {
            let label = document.createElement('span');
            label.classList.add('scivi_fsgraph_node_label');
            label.innerText = '--insert-text-here--';
            label.hidden = true;
            label.style.opacity = '0.85';
            label.style.fontSize = this.fontSizeString;
            this._labels[id] = label;
            this._container.appendChild(label);
        }

        return this._labels[id];
    }

    _buildUi() {
        let baseContainer = $('#scivi_fsgraph_settings')[0];

        let nameSpan = document.createElement('span');
        nameSpan.textContent = 'Font size: ';

        let slider = document.createElement('div');

        const that = this;
        $(slider).slider({
            min: _FontSizeDiap[0],
            max: _FontSizeDiap[1],
            value: that._fontSize,
            step: 1,
            slide: (event, ui) => {
                that.fontSize = ui.value;
            }
        });

        baseContainer.appendChild(nameSpan);
        baseContainer.appendChild(slider);
    }
}
