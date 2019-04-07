import { VivaWebGLRenderer } from './VivaWebGLRenderer';
import { VivaImageNodeUI } from './VivaImageNodeUI';
import { getOrCreateTranslatorInstance } from './Misc/Translator';
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/spinner';
// @ts-ignore
import styles from './styles/node-label.css';

const _FontSizeDiap: [number, number] = [4, 72];
// HACK: it's to hard to determine supported fonts in runtime
// (see https://stackoverflow.com/questions/3368837/list-every-font-a-users-browser-can-display,
// https://www.bramstein.com/writing/detecting-system-fonts-without-flash.html
// and so on)
const PredefinedFontList = ['Calibri', 'Consolas', 'Tahoma', 'Times New Roman', 'Verdana'];
const className = 'scivi_fsgraph_node_label';
const expectedStyleTitle = 'webpack-compiled';

interface StyleDef {
    rule: CSSStyleRule,
    font: string;
    defaultFont: string;
    defaultBorderWidth: string
    fallbackFontList: string;
}

export class NodeUIBuilder {
    private _fontSize: number = 16;
    private _labels: HTMLSpanElement[] = [];
    private _container: HTMLElement;
    private _labelStyle: StyleDef | null;

    constructor(private _renderer: VivaWebGLRenderer) {
        this._container = _renderer._container;
        this._labelStyle = this._prepareStyleClass();

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
        this._labelStyle.rule.style.fontSize = fontString;

        this._invalidateLabels();
    }

    set fontLigature(value: string) {
        // TODO: rewrite this
        this._labelStyle.font = value;
        this._labelStyle.rule.style.fontFamily = `${this._labelStyle.font}, ${this._labelStyle.fallbackFontList}`;
        
        this._invalidateLabels();
    }

    get borderVisible(): boolean {
        return !!this._labelStyle.rule.style.borderWidth && (this._labelStyle.rule.style.borderWidth != '0px');
    }

    set borderVisible(value: boolean) {
        this._labelStyle.rule.style.borderWidth = value ? this._labelStyle.defaultBorderWidth : '0px';
    }

    private _prepareStyleClass(): StyleDef {
        const compiledStyles = ListToArray(document.styleSheets)
            .filter((stylesheet: CSSStyleSheet) => (stylesheet.title === expectedStyleTitle)) as CSSStyleSheet[];
        if (!compiledStyles || !compiledStyles.length) {
            return null;
        }
        const targetSelector = `.${styles[className]}`;
        const targetStyle = compiledStyles
            .map(v => ListToArray(v.cssRules))
            .reduce((prev, current) => [...prev, ...current])
            .filter(rule => rule.type == CSSRule.STYLE_RULE)
            .filter((rule: CSSStyleRule) => rule.selectorText === targetSelector) as CSSStyleRule[];
        if (!targetStyle.length) {
            return null;
        }
        const fontArray = targetStyle[0].style.fontFamily.split(',');
        const defaultFont = fontArray[0] || 'Arial';

        return {
            font: defaultFont,
            defaultFont: defaultFont,
            defaultBorderWidth: targetStyle[0].style.borderWidth,
            fallbackFontList: fontArray.slice(1).join(','),
            rule: targetStyle[0]
        };
    }

    private get fontSizeString() {
        return `${this._fontSize}px`;
    }

    private _ensureLabelExists(id: number) {
        if (!this._labels[id]) {
            let label = document.createElement('span');
            label.classList.add(styles[className]);
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
        [this._labelStyle.defaultFont, ...PredefinedFontList].forEach(font => {
            const option = document.createElement('option');
            option.value = option.text = font;
            fontList.appendChild(option);
        });
        fontList.value = this._labelStyle.defaultFont;
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
        cb.checked = this.borderVisible;
        cb.onchange = (ev) => {
            this.borderVisible = cb.checked;
        };

        innerContainer.appendChild(document.createElement('br'));
        innerContainer.appendChild(nameSpan);
        innerContainer.appendChild(cb);

        $('#scivi_fsgraph_settings_appearance').append(innerContainer);
    }
}

function ListToArray<T>(list: {
    length: number
    item: (_: number) => T
}): T[] {
    const res = [];
    for (let i = 0; i < list.length; i++) {
        res[i] = list.item(i);
    }
    return res;
}