namespace SciViGraph
{
    export class Edge
    {
        private m_fromColor: number;
        private m_toColor: number;
        private m_alpha: number;
        private m_batch: EdgeBatch;
        private m_highlight: HighlightType;
        private m_visible: boolean;

        public static passiveEdgeAlpha = 0.1;
        private static readonly m_hoveredEdgeAlpha = 1.0;
        private static readonly m_selectedEdgeAlpha = 1.0;

        public static readonly minThickness = 1.5;
        public static readonly maxThickness = 10.0;

        constructor(public source: Node, public target: Node, public weight: number)
        {
            this.m_fromColor = 0;
            this.m_toColor = 0;
            this.m_alpha = 0;
            this.m_batch = undefined;
            this.m_highlight = undefined;
            this.m_visible = true;
        }

        private rgb2hsv(rgb: number): number[]
        {
            let result = [0, 0, 0];

            let r = rgb >> 16 & 0xFF;
            let g = rgb >> 8 & 0xFF;
            let b = rgb & 0xFF;

            r /= 255;
            g /= 255;
            b /= 255;

            let mm = Math.max(r, g, b);
            let m = Math.min(r, g, b);
            let c = mm - m;

            if (c == 0)
                result[0] = 0;
            else if (mm == r)
                result[0] = ((g - b) / c) % 6;
            else if (mm == g)
                result[0] = (b - r) / c + 2;
            else
                result[0] = (r - g) / c + 4;

            result[0] *= 60;
            if (result[0] < 0)
                result[0] += 360;

            result[2] = mm;
            if (result[2] == 0)
                result[1] = 0;
            else
                result[1] = c / result[2];

            result[1] *= 100;
            result[2] *= 100;

            return result;
        }

        private hsv2rgb(hsv: number[]): number
        {
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

        private passiveColor(rgb: number)
        {
            let hsv = this.rgb2hsv(rgb);
            hsv[1] = 10;
            hsv[2] = 90;
            return this.hsv2rgb(hsv);
        }

        public setBatch(batch: EdgeBatch)
        {
            this.m_batch = batch;
        }

        set highlight(hl: HighlightType)
        {
            if (hl != this.m_highlight) {
                this.m_highlight = hl;
                let fromColor = this.source.groupColor;
                let toColor = this.target.groupColor;
                switch (this.m_highlight) {
                    case HighlightType.None: {
                        this.m_fromColor = this.passiveColor(fromColor)
                        this.m_toColor = this.passiveColor(toColor);
                        this.m_alpha = Edge.passiveEdgeAlpha;
                        this.m_batch.sendToBack();
                        break;
                    }

                    case HighlightType.Hover: {
                        this.m_fromColor = fromColor;
                        this.m_toColor = toColor;
                        this.m_alpha = Edge.m_hoveredEdgeAlpha;
                        this.m_batch.sendToFront();
                        break;
                    }

                    case HighlightType.Selection: {
                        this.m_fromColor = fromColor;
                        this.m_toColor = toColor;
                        this.m_alpha = Edge.m_selectedEdgeAlpha;
                        this.m_batch.sendToFront();
                        break;
                    }
                }

                this.m_batch.setNeedsUpdate();
            }
        }

        get highlight(): HighlightType
        {
            return this.m_highlight;
        }

        set visible(v: boolean)
        {
            if (v != this.m_visible) {
                this.m_visible = v;
                this.m_batch.setNeedsUpdate();
            }
        }

        get visible(): boolean
        {
            return this.m_visible;
        }

        get fromColor(): number
        {
            return this.m_fromColor;
        }

        get toColor(): number
        {
            return this.m_toColor;
        }

        get alpha(): number
        {
            return this.m_alpha;
        }

        public invalidate()
        {
            this.m_highlight = undefined;
        }
    }
}
