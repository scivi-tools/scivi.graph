
import Viva from './viva-proxy';

export default class ColorConverter {
    /**
     * Expected format: rgba 
     * @param {number} color
     * @returns {string}
    */
    static rgbaToHex(color) {
        return '#' + ((color >> 8) & 0xFFFFFF).toString(16).substr(-6).toUpperCase();
    }

    /**
     * @param {string} hexrgb like '#rrggbb'
     * @param {number} alpha 
     */
    static hexToRgba(hexrgb, alpha) {
        let sliced = hexrgb.slice(1);
        let hexnum = parseInt(sliced, 16);

        return ((hexnum << 8) | (alpha & 0xFF)) & 0xFFFFFFFF;
    }

    /** 
     * @param {number} color RGBA format
     * @returns {number} Alpha value 0-255
    */
    static rgba2a(color) {
        return color & 0xFF;
    }
};
