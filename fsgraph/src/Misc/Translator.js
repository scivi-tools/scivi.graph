
import * as Polyglot from 'node-polyglot';

export class Translator {
    /**
     * 
     * @param {string} locale 
     */
    constructor(locale = 'ru') {
        this._locale = locale;

        this._instance = new Polyglot({
            allowMissing: false,
            locale
        });
    }

    /**
     * 
     * @param {Object.<string, Object.<string, string>>} dict 
     */
    extend(dict) {
        this._instance.extend(dict[this._locale]);

        return this;
    }

    /**
     * 
     * @param {string} key 
     * @returns {string}
     */
    apply(key) {
        return this._instance.t(key);
    }

    /**
     * Do not use it, too slow too damned
     * @deprecated
     * @param {Node} item 
     */
    applyRecursively(item) {
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
/** @type {Translator} */
let TranslatorInstance;

export function getOrCreateTranslatorInstance(lang = '') {
    if (!TranslatorInstance) {
        TranslatorInstance = new Translator(lang);
    }
    return TranslatorInstance;
}
