import { VivaWebGLRenderer } from './VivaWebGLRenderer';
import { VivaImageNodeUI } from './VivaImageNodeUI';
import { getOrCreateTranslatorInstance } from './Misc/Translator';
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/spinner';

const _FontSizeDiap: [number, number] = [4, 72];

export class NodeUIBuilder {
    private _fontSize: number = 16;
    private _labels: HTMLSpanElement[] = [];
    private _container: HTMLElement;

    constructor(private _renderer: VivaWebGLRenderer) {
        this._container = _renderer._container

        this._buildUi();
    }

    buildUI(graphics: any, node: Ngraph.Graph.Node): VivaImageNodeUI {
        let title = this._ensureLabelExists(node.id);
        const result = new VivaImageNodeUI(graphics, node, title);
        result.showLabel = result.node.data.groupId === 0;
        return result;
    }

    set fontSize(value: number) {
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

    _ensureLabelExists(id: string | number) {
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

    private _buildUi() {
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
