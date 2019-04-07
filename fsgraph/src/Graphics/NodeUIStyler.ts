import { BuiltinStyleObserver } from "../Misc/BuiltinStyleObserver";

// @ts-ignore
import styles from '../styles/node-label.css';

export class NodeUIStyler {
    public readonly className = 'scivi_fsgraph_node_label';
    private _rule: CSSStyleRule;
    private fallbackFontList: string = '';
    private defaultFont: string = '';
    private _font: string = '';
    private defaultBorderWidth: string = '';

    constructor(observer: BuiltinStyleObserver) {
        if (!observer) {
            throw new Error('Got null-valued BuiltinStyleObserver');
        }
        const selector = `.${styles[this.className]}`;
        const desiredRules = observer.rules.filter(v => v.selectorText === selector);
        if (!desiredRules || !desiredRules.length) {
            throw new Error('Got null-valued CSSRules');
        }
        this.rule = desiredRules[0];
    }

    private set rule(value: CSSStyleRule) {
        const fontArray = value.style.fontFamily.split(',');
        this._font = this.defaultFont = fontArray[0] || 'Arial';
        this.fallbackFontList = fontArray.slice(1).join(',');
        this.defaultBorderWidth = value.style.borderWidth;

        this._rule = value;
    }

    private get rule(): CSSStyleRule {
        return this._rule;
    }

    get decoratedClassName(): string {
        return styles[this.className];
    }

    get supportedFonts(): string[] {
        // HACK: it's to hard to determine supported fonts in runtime
        // (see https://stackoverflow.com/questions/3368837/list-every-font-a-users-browser-can-display,
        // https://www.bramstein.com/writing/detecting-system-fonts-without-flash.html
        // and so on)
        return [this.defaultFont, 'Calibri', 'Consolas', 'Tahoma', 'Times New Roman', 'Verdana'];
    }

    set fontSize(value: number) {
        this.rule.style.fontSize = `${value}px`;
    }

    get fontLigature(): string {
        return this._font;
    }

    set fontLigature(value: string) {
        this.rule.style.fontFamily = `${value}, ${this.fallbackFontList}`;
        this._font = value;
    }

    // TODO: rewrite next two

    get borderVisible(): boolean {
        return !!this.rule.style.borderWidth && (this.rule.style.borderWidth != '0px');
    }

    set borderVisible(value: boolean) {
        this.rule.style.borderWidth = value ? this.defaultBorderWidth : '0px';
    }
}