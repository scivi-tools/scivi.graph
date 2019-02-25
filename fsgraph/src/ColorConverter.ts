export class ColorConverter {
    /**
     * Expected format: rgba
    */
    static rgbaToHex(color: number): string {
        return '#' + ((color >> 8) & 0xFFFFFF).toString(16).substr(-6).toUpperCase();
    }

    /**
     * @param hexrgb like '#rrggbb'
     */
    static hexToRgba(hexrgb: string, alpha: number): number {
        let sliced = hexrgb.slice(1);
        let hexnum = parseInt(sliced, 16);

        return ((hexnum << 8) | (alpha & 0xFF)) & 0xFFFFFFFF;
    }

    /**
     * @param hexrgb like '#rrggbb'
     */
    static hexToRgb(hexrgb: string): number {
        let sliced = hexrgb.slice(1);
        let hexnum = parseInt(sliced, 16);

        return hexnum & 0xFFFFFF;
    }

    /** 
     * @param color RGBA format
     * @returns Alpha value 0-255
    */
    static rgba2a(color: number): number {
        return color & 0xFF;
    }

    static rgb2hsv(rgb: number): number[] {
        const result = [0, 0, 0];

        let r = rgb >> 16 & 0xFF;
        let g = rgb >> 8 & 0xFF;
        let b = rgb & 0xFF;

        r /= 255;
        g /= 255;
        b /= 255;

        let mm = Math.max(r, g, b);
        let m = Math.min(r, g, b);
        let c = mm - m;

        if (c === 0)
            result[0] = 0;
        else if (mm === r)
            result[0] = ((g - b) / c) % 6;
        else if (mm === g)
            result[0] = (b - r) / c + 2;
        else
            result[0] = (r - g) / c + 4;

        result[0] *= 60;
        if (result[0] < 0)
            result[0] += 360;

        result[2] = mm;
        if (result[2] === 0)
            result[1] = 0;
        else
            result[1] = c / result[2];

        result[1] *= 100;
        result[2] *= 100;

        return result;
    }

    static hsv2rgb(hsv: number[]): number {
        if (hsv[0] < 0)
            hsv[0] = 0;
        if (hsv[1] < 0)
            hsv[1] = 0;
        if (hsv[2] < 0)
            hsv[2] = 0;

        if (hsv[0] >= 360)
            hsv[0] = 359;
        if (hsv[1] > 100)
            hsv[1] = 100;
        if (hsv[2] > 100)
            hsv[2] = 100;

        hsv[0] /= 60;
        hsv[1] /= 100;
        hsv[2] /= 100;

        let c = hsv[1] * hsv[2];
        let x = c * (1 - Math.abs(hsv[0] % 2 - 1));
        let r = 0;
        let g = 0;
        let b = 0;

        if (hsv[0] >= 0 && hsv[0] < 1) {
            r = c;
            g = x;
        } else if (hsv[0] >= 1 && hsv[0] < 2) {
            r = x;
            g = c;
        } else if (hsv[0] >= 2 && hsv[0] < 3) {
            g = c;
            b = x;
        } else if (hsv[0] >= 3 && hsv[0] < 4) {
            g = x;
            b = c;
        } else if (hsv[0] >= 4 && hsv[0] < 5) {
            r = x;
            b = c;
        } else {
            r = c;
            b = x;
        }

        let m = hsv[2] - c;
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return (r << 16) | (g << 8) | b;
    }
};
