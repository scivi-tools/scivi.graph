import { VivaWebGLRenderer } from './VivaWebGLRenderer';
import { VivaImageNodeUI } from './VivaImageNodeUI';
import { getOrCreateTranslatorInstance } from './Misc/Translator';
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/spinner';
// @ts-ignore
import styles from './styles/node-label.css';

const _FontSizeDiap: [number, number] = [4, 72];
const className = 'scivi_fsgraph_node_label';
const expectedStyleTitle = 'webpack-compiled';

interface StyleDef {
    rule: CSSStyleRule,
    font: string;
    defaultFont: string;
    fallbackFontList: string;
}

export class NodeUIBuilder {
    private _fontSize: number = 16;
    private _labels: HTMLSpanElement[] = [];
    private _container: HTMLElement;
    private _labelStyle: StyleDef | null;

    constructor(private _renderer: VivaWebGLRenderer) {
        this._container = _renderer._container

        this._buildUi();
        this._labelStyle = this._prepareStyleClass();
        console.log(this._labelStyle);
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
            label.style.fontSize = this.fontSizeString;
            this._labels[id] = label;
            this._container.appendChild(label);
        }

        return this._labels[id];
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