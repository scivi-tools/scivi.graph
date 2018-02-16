namespace SciViGraph
{
    export class RingScale extends Curve
    {
        static readonly m_fontSize = 25;

        private m_highlights: RingScaleSegment[];
        private m_highlightedSegment: number;
        private m_names: string[];

        constructor(private m_inRadius: number, private m_outRadius: number, private m_width: number, 
                    private m_container: HTMLElement)
        {
            super();

            this.m_highlights = [];
            this.m_highlightedSegment = -1;
            this.m_names = [];

            let tooltip = document.createElement("div");
            tooltip.className = "scivi_graph_tooltip";
            m_container.parentElement.parentElement.appendChild(tooltip)
            $(".scivi_graph_tooltip").hide(0);
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

            const letterLen = RingScale.m_fontSize / 2.0;
            let arcLen = this.m_outRadius * (to - from);
            let n = Math.min(name.length, Math.floor(arcLen / letterLen));
            let textLen = letterLen * n;
            
            let aStep = letterLen / this.m_outRadius;
            let phi = (to + from) / 2.0;
            let flipFlop = phi >= Math.PI;
            for (let i = 0; i < n; ++i) {
                let a = phi;
                if (flipFlop)
                    a += i * aStep - (aStep * n) * 0.5 + aStep;
                else
                    a -= i * aStep - (aStep * n) * 0.5 + aStep * 0.25;
                this.addText(name.charAt(i), a, flipFlop, this.m_outRadius, textColor);
            }

            r = this.m_outRadius - this.m_width / 2.0;
            let hl = new RingScaleSegment(from, to, r - this.m_inRadius, (r + this.m_inRadius) / 2.0, color);
            this.addChild(hl);
            this.m_highlights.push(hl);

            this.m_names.push(name);
        }

        public handleCursorMove(x: number, y: number, s: number, gx: number, gy: number): boolean
        {
            let r = x * x + y * y;
            let w = this.m_width / 2.0;
            let inRing = this.m_outRadius - w;
            let outRing = this.m_outRadius + w;
            const offset = 20;
            s *= s;
            if (r > inRing * inRing * s && r < outRing * outRing * s) {
                let a = Math.atan2(y, x);
                if (a < 0.0)
                    a += 2.0 * Math.PI;
                for (let i = 0, n = this.m_highlights.length; i < n; ++i) {
                    if (this.m_highlights[i].containsAngle(a)) {
                        if (i != this.m_highlightedSegment) {
                            if (this.m_highlightedSegment != -1)
                                this.m_highlights[this.m_highlightedSegment].visible = false;
                            this.m_highlightedSegment = i;
                            this.m_highlights[i].visible = true;
                            $(".scivi_graph_tooltip").html(this.m_names[i]);
                            $(".scivi_graph_tooltip").css({top: gy, left: gx + offset});
                            $(".scivi_graph_tooltip").stop(true);
                            $(".scivi_graph_tooltip").fadeIn(100);
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
            if (this.m_highlightedSegment != -1) {
                this.m_highlights[this.m_highlightedSegment].visible = false;
                this.m_highlightedSegment = -1;
                $(".scivi_graph_tooltip").stop(true);
                $(".scivi_graph_tooltip").fadeOut(100);
                return true;
            }
            return false;
        }

        private addText(label: string, a: number, flipFlop: boolean, r: number, textColor: number)
        {
            let text = new PIXI.Text(label);
            text.style = new PIXI.TextStyle({
                fontFamily: "Lucida Console, Monaco, monospace",
                fontSize: RingScale.m_fontSize.toString() + "px",
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
    }
}
