const expectedStyleTitle = 'webpack-compiled';
let _observer: BuiltinStyleObserver = null;

export class BuiltinStyleObserver {
    private constructor(public readonly rules: CSSStyleRule[]) { }

    static getStyleObserver(): BuiltinStyleObserver | null {
        if (!!_observer) {
            return _observer;
        }

        const compiledStyles = ListToArray(document.styleSheets)
            .filter((stylesheet: CSSStyleSheet) => (stylesheet.title === expectedStyleTitle)) as CSSStyleSheet[];
        if (!compiledStyles || !compiledStyles.length) {
            return null;
        }
        const targetStyle = compiledStyles
            .map(v => ListToArray(v.cssRules))
            .reduce((prev, current) => [...prev, ...current])
            .filter(rule => rule.type == CSSRule.STYLE_RULE) as CSSStyleRule[];
        return new BuiltinStyleObserver(targetStyle);
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
