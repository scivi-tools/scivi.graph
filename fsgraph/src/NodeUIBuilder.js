//@ts-check
/// <reference path="./@types/ngraph.d.ts" />
import { VivaWebGLRenderer } from './VivaWebGLRenderer';
import { VivaImageNodeUI } from './VivaImageNodeUI';
import { getOrCreateTranslatorInstance } from './Misc/Translator';
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/spinner';

const _FontSizeDiap = [4, 72];

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
     * @param {*} graphics
     * @param {NgraphGraph.Node} node
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
                // HACK: костыль! лень ыло заводить лишнюю переменную или не менее костыльно прокидывать событие изменения размера шрифта каждому визуалу
                label.hidden = true;
            }
        }

        this._renderer.rerender();
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
        const tr = getOrCreateTranslatorInstance();
        let baseContainer = $('#scivi_fsgraph_settings_appearance')[0];

        const innerContainer = document.createElement('div');
        innerContainer.id = 'scivi_fsgraph_settings_nodelabel';

        let nameSpan = document.createElement('span');
        nameSpan.textContent = `${tr.apply('#font_size')}: `;

        let spinner = document.createElement('input');
        spinner.value = this._fontSize.toString();

        const confirmBuuton = document.createElement('div');
        const that = this;
        $(confirmBuuton).button({
            label: tr.apply('#apply')
        });
        $(confirmBuuton).click((event) => {
            const realFontSize = parseInt(spinner.value);
            if ((_FontSizeDiap[0] <= realFontSize) && (_FontSizeDiap[1] >= realFontSize)) {
                that.fontSize = realFontSize;
            }
            spinner.value = that._fontSize.toString();
        });

        innerContainer.appendChild(nameSpan);
        innerContainer.appendChild(document.createElement('br'));
        innerContainer.appendChild(spinner);
        innerContainer.appendChild(confirmBuuton);
        baseContainer.appendChild(innerContainer)
    }
}
