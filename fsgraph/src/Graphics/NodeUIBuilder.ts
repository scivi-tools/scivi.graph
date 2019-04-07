import { VivaWebGLRenderer } from '../VivaWebGLRenderer';
import { VivaImageNodeUI } from '../VivaImageNodeUI';
import { getOrCreateTranslatorInstance } from '../Misc/Translator';
import { BuiltinStyleObserver } from '../Misc/BuiltinStyleObserver';
import { NodeUIStyler } from './NodeUIStyler';
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/spinner';

const _FontSizeDiap: [number, number] = [4, 72];

export class NodeUIBuilder {
    private _fontSize: number = 16;
    private _labels: HTMLSpanElement[] = [];
    private _container: HTMLElement;
    private _styler = new NodeUIStyler(BuiltinStyleObserver.getStyleObserver());

    constructor(private _renderer: VivaWebGLRenderer) {
        this._container = _renderer._container;

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
        this._styler.fontSize = value;

        this._invalidateLabels();
    }

    set fontLigature(value: string) {
        this._styler.fontLigature = value;
        
        this._invalidateLabels();
    }

    set borderVisible(value: boolean) {
        this._styler.borderVisible = value;

        // TODO: jquery does not count border with in element size
        // this._invalidateLabels();
    }

    private get fontSizeString() {
        return `${this._fontSize}px`;
    }

    private _ensureLabelExists(id: number) {
        if (!this._labels[id]) {
            let label = document.createElement('span');
            label.classList.add(this._styler.decoratedClassName);
            label.innerText = '--insert-text-here--';
            label.hidden = true;
            label.style.opacity = '0.85';
            this._labels[id] = label;
            this._container.appendChild(label);
        }

        return this._labels[id];
    }

    private _invalidateLabels() {
        this._labels
            .filter(label => !!label)
            .forEach(label => {
                label.hidden = true;
            });
        this._renderer.rerender();
    }

    private _buildUi() {
        const tr = getOrCreateTranslatorInstance();

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
        }).click((event) => {
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
        
        
        nameSpan = document.createElement('span');
        nameSpan.textContent = `${tr.apply('#font')}: `;

        const fontList = document.createElement('select');
        this._styler.supportedFonts.forEach(font => {
            const option = document.createElement('option');
            option.value = option.text = font;
            fontList.appendChild(option);
        });
        fontList.value = this._styler.fontLigature;
        fontList.addEventListener('change', ev => {
            const target = ev.target as typeof fontList;
            this.fontLigature = target.value;
        });

        innerContainer.appendChild(document.createElement('br'));
        innerContainer.appendChild(nameSpan);
        innerContainer.appendChild(document.createElement('br'));
        innerContainer.appendChild(fontList);

        // border style
        nameSpan = document.createElement('span');
        nameSpan.textContent = tr.apply('#border_visible');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = this._styler.borderVisible;
        cb.onchange = (ev) => {
            this.borderVisible = cb.checked;
        };

        innerContainer.appendChild(document.createElement('br'));
        innerContainer.appendChild(nameSpan);
        innerContainer.appendChild(cb);

        $('#scivi_fsgraph_settings_appearance').append(innerContainer);
    }
}
