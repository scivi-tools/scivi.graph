// @ts-check
import Poly from 'node-polyglot'

export class Translator {
    /**
     * 
     * @param {string} locale 
     */
    constructor(locale = 'ru') {
        this._locale = locale;

        this._instance = new Poly({
            allowMissing: false,
            locale
        });
    }

    /**
     * 
     * @param {Object.<string, string>} dict 
     */
    extend(dict) {
        this._instance.extend(dict);
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
     * 
     * @param {Node} item 
     */
    /*applyRecursively(item) {
        if (item.nodeType === Node.TEXT_NODE) {
            item.nodeValue = this.apply(item.nodeValue);
        } else {
            const childNodesCount = item.childNodes.length;
            for (let i = 0; i < childNodesCount; i++) {
                let childitem = (item.childNodes.item(i));
                this.applyRecursively(childitem);
            }
        }
    }*/
}
