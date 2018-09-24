namespace SciViCGraph
{
    export class RingScale extends Curve
    {
        private m_highlights: RingScaleSegment[];
        private m_highlightedSegment: number;
        private m_selections: RingScaleSegment[];
        private m_selectedSegment: number;
        private m_names: string[];

        constructor(private m_inRadius: number, private m_outRadius: number, private m_width: number, 
                    private m_fontSize, private m_container: HTMLElement)
        {
            super();

            this.m_highlights = [];
            this.m_highlightedSegment = -1;
            this.m_selections = [];
            this.m_selectedSegment = -1;
            this.m_names = [];
        }

        public addSegment(from: number, to: number, color: number, textColor: number, name: string)
        {
            let c = { from: color, to: color, alpha: 1.0 };
            let as = Math.sin(from);
            let ac = Math.cos(from);
            let r = this.m_outRadius + this.m_width / 2.0;

            this.lineStyle(1, 0x0, 1);
            this.m_colors.push(c);
            this.moveTo(this.m_inRadius * ac, this.m_inRadius * as);
            this.lineTo(r * ac, r * as);
            this.moveTo(this.m_outRadius * ac, this.m_outRadius * as);

            this.lineStyle(this.m_width, 0x0, 1);
            this.m_colors.push(c);
            this.arc(0, 0, this.m_outRadius, from, to, false);

            const letterLen = this.m_fontSize / 2.0;
            let arcLen = this.m_outRadius * (to - from);
            let n = Math.min(name.length, Math.floor(arcLen / letterLen));
            let textLen = letterLen * n;
            
            let aStep = letterLen / this.m_outRadius;
            let phi = (to + from) / 2.0;
            let flipFlop = phi >= Math.PI;
            for (let i = 0; i < n; ++i) {
                let a = phi;
                if (flipFlop)
                    a += i * aStep - (aStep * n) * 0.5 + aStep * 0.75;
                else
                    a -= i * aStep - (aStep * n) * 0.5 + aStep * 0.25;
                this.addText(name.charAt(i), a, flipFlop, this.m_outRadius, textColor);
            }

            r = this.m_outRadius - this.m_width / 2.0;
            const hl = new RingScaleSegment(from, to, r - this.m_inRadius, (r + this.m_inRadius) / 2.0, color, 0.1,
                                            name, textColor);
            this.addChild(hl);
            this.m_highlights.push(hl);

            const sl = new RingScaleSegment(from, to, this.m_width, this.m_outRadius, 0xFD3C00, 0.5,
                                            name, textColor);
            this.addChild(sl);
            this.m_selections.push(sl);

            this.m_names.push(name);
        }

        public hitWithPoint(x: number, y: number, s: number): boolean
        {
            const r = x * x + y * y;
            const w = this.m_width / 2.0;
            const inRing = this.m_outRadius - w;
            const outRing = this.m_outRadius + w;
            s *= s;
            return r > inRing * inRing * s && r < outRing * outRing * s;
        }

        public handleCursorMove(x: number, y: number, s: number, gx: number, gy: number): boolean
        {
            const offset = 20;
            if (this.hitWithPoint(x, y, s)) {
                let a = Math.atan2(y, x);
                if (a < 0.0)
                    a += 2.0 * Math.PI;
                for (let i = 0, n = this.m_highlights.length; i < n; ++i) {
                    if (this.m_highlights[i].containsAngle(a)) {
                        if (i !== this.m_highlightedSegment) {
                            if (this.m_highlightedSegment !== -1 && this.m_selectedSegment !== this.m_highlightedSegment)
                                this.m_highlights[this.m_highlightedSegment].visible = false;
                            this.m_highlightedSegment = i;
                            this.m_highlights[i].visible = true;
                            if (this.m_names[i].length > 0) {
                                $(".scivi_graph_tooltip").html(this.m_names[i]);
                                $(".scivi_graph_tooltip").css({top: gy, left: gx + offset});
                                $(".scivi_graph_tooltip").stop(true);
                                $(".scivi_graph_tooltip").fadeIn(100);
                                $(".scivi_graph_tooltip")[0]["host"] = this;
                            } else {
                                $(".scivi_graph_tooltip").stop(true);
                                $(".scivi_graph_tooltip").fadeOut(100);
                            }
                            return true;
                        }
                        $(".scivi_graph_tooltip").css({top: gy, left: gx + offset, position: "absolute"});
                        return false;
                    }
                }
            } else {
                return this.dropHighlight();
            }
            return false;
        }

        public dropHighlight(): boolean
        {
            if (this.m_highlightedSegment !== -1) {
                if (this.m_selectedSegment !== this.m_highlightedSegment)
                    this.m_highlights[this.m_highlightedSegment].visible = false;
                this.m_highlightedSegment = -1;
                if ($(".scivi_graph_tooltip")[0]["host"] === this) {
                    $(".scivi_graph_tooltip").stop(true);
                    $(".scivi_graph_tooltip").fadeOut(100);
                }
                return true;
            }
            return false;
        }

        public handleSelection(): boolean
        {
            let result = false;
            if (this.m_selectedSegment !== -1) {
                if (this.m_selectedSegment !== this.m_highlightedSegment)
                    this.m_highlights[this.m_selectedSegment].visible = false;
                this.m_selections[this.m_selectedSegment].visible = false;
                result = true;
            }
            if (this.m_highlightedSegment === this.m_selectedSegment)
                this.m_selectedSegment = -1;
            else {
                this.m_selectedSegment = this.m_highlightedSegment;
                if (this.m_selectedSegment !== -1) {
                    this.m_selections[this.m_selectedSegment].visible = true;
                    result = true;
                }
            }
            return result;
        }

        private addText(label: string, a: number, flipFlop: boolean, r: number, textColor: number)
        {
            let text = new PIXI.Text(label);
            text.style = new PIXI.TextStyle({
                fontFamily: "Lucida Console, Monaco, monospace",
                fontSize: this.m_fontSize.toString() + "px",
                fontWeight: "bold",
                fill: color2string(textColor)
            });
            text.position.set(r * Math.cos(a), r * Math.sin(a));
            text.rotation = a - Math.PI / 2.0;
            if (flipFlop) {
                text.scale.set(-0.5, -0.5);
                text.anchor.set(1.0, 0.5);
            } else {
                text.scale.set(0.5, 0.5);
                text.anchor.set(0.0, 0.5);
            }
            this.addChild(text);
        }

        public nodeInSelectedSegment(node: Node): boolean
        {
            return this.m_selectedSegment !== -1 &&
                   this.m_selections[this.m_selectedSegment].containsAngle(node.rotation);
        }

        get radius(): number
        {
            return this.m_outRadius;
        }

        get width(): number
        {
            return this.m_width;
        }

        get segmentSelected(): boolean
        {
            return this.m_selectedSegment !== -1;
        }

        get highlightedSegment(): RingScaleSegment
        {
            return this.m_highlightedSegment === -1 ? null : this.m_highlights[this.m_highlightedSegment];
        }
    }
}
