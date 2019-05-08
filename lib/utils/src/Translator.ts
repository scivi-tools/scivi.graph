import * as Polyglot from 'node-polyglot';

export class Translator {
    private _instance: Polyglot;
    constructor(
        private _locale: string = 'ru'
    ) {
        this._instance = new Polyglot({
            allowMissing: false,
            locale: _locale
        });
    }

    extend(dict: {[_: string]: {[_: string]: string}}) {
        this._instance.extend(dict[this._locale]);

        return this;
    }

    apply(key: string): string {
        return this._instance.t(key);
    }

    /**
     * Do not use it, too slow too damned
     * @deprecated
     */
    applyRecursively(item: Node) {
        if (item.nodeType === Node.TEXT_NODE) {
            item.nodeValue = this.apply(item.nodeValue || '');
        } else {
            const childNodesCount = item.childNodes.length;
            for (let i = 0; i < childNodesCount; i++) {
                let childitem = (item.childNodes.item(i));
                this.applyRecursively(childitem);
            }
        }
    }
}

let TranslatorInstance: Translator;
export function getOrCreateTranslatorInstance(lang = '') {
    if (!TranslatorInstance) {
        TranslatorInstance = new Translator(lang);
    }
    return TranslatorInstance;
}
