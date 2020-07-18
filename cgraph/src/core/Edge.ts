namespace SciViCGraph
{
    export class Edge
    {
        private m_fromColor: number;
        private m_toColor: number;
        private m_alpha: number;
        private m_batch: EdgeBatch;
        private m_glow: Curve;
        private m_highlight: HighlightType;
        private m_visible: boolean;
        private m_thickness: number;
        private m_glowThickness: number;
        private m_cursorPos: { x: number, y: number };
        private m_isDirected: boolean;

        public static passiveEdgeAlpha = 0.5;
        private static readonly m_hoveredEdgeAlpha = 1.0;
        private static readonly m_selectedEdgeAlpha = 1.0;
        private static readonly m_detachedColor = 0xff0000;

        public static readonly minThickness = 1.5;
        public static readonly maxThickness = 10.0;

        constructor(public source: Node, public target: Node, public weight: number, public tooltip: string)
        {
            this.m_fromColor = 0;
            this.m_toColor = 0;
            this.m_alpha = 0;
            this.m_batch = null;
            this.m_glow = null;
            this.m_highlight = undefined;
            this.m_visible = true;
            this.m_thickness = 0.0;
            this.m_glowThickness = 0.0;
            this.m_cursorPos = { x: 0, y: 0 };
            this.m_isDirected = false;
        }

        private passiveColor(rgb: number)
        {
            let hsv = Color.rgb2hsv(rgb);
            hsv[1] = 10;
            hsv[2] = 90;
            return Color.hsv2rgb(hsv);
        }

        public setBatch(batch: EdgeBatch)
        {
            this.m_batch = batch;
        }

        public setNeedsUpdate()
        {
            this.m_batch.setNeedsUpdate();
        }

        set highlight(hl: HighlightType)
        {
            if (hl !== this.m_highlight) {
                this.m_highlight = hl;
                let fromColor = this.source ? this.source.groupColor : Edge.m_detachedColor;
                let toColor = this.target ? this.target.groupColor : Edge.m_detachedColor;
                switch (this.m_highlight) {
                    case HighlightType.None: {
                        this.m_fromColor = this.passiveColor(fromColor)
                        this.m_toColor = this.passiveColor(toColor);
                        this.m_alpha = Edge.passiveEdgeAlpha;
                        this.m_batch.sendToBack();
                        break;
                    }

                    case HighlightType.Hover: 
                    case HighlightType.Selection:
                    case HighlightType.Multiselect: {
                        this.m_fromColor = fromColor;
                        this.m_toColor = toColor;
                        this.m_alpha = Edge.m_hoveredEdgeAlpha;
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
            if (v !== this.m_visible) {
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

        get thickness(): number
        {
            return this.m_thickness;
        }

        set thickness(th: number)
        {
            this.m_thickness = th;
        }

        get isDirected(): boolean
        {
            return this.m_isDirected;
        }

        set isDirected(d: boolean)
        {
            this.m_isDirected = d;
        }

        public invalidate(wipeInternals: boolean)
        {
            this.m_highlight = undefined;
            if (wipeInternals)
                this.m_glow = null;
        }

        set isGlowing(g: boolean)
        {
            if (this.m_batch) {
                if (g && this.m_glow && this.m_glowThickness !== this.m_thickness) {
                    this.m_glow.parent.removeChild(this.m_glow);
                    this.m_glow = null;
                }
                if (this.m_glow) {
                    this.m_glow.visible = g;
                    if (g)
                        this.m_glow.bringToFront()
                } else {
                    this.m_glow = this.m_batch.createGlow(this);
                    this.m_glowThickness = this.m_thickness;
                }
            }
        }

        private minMaxCP(cp: Point[]): Point[]
        {
            let minCP = { x: cp[0].x, y: cp[0].y };
            let maxCP = { x: cp[0].x, y: cp[0].y };
            for (let i = 1, n = cp.length; i < n; ++i) {
                if (cp[i].x < minCP.x)
                    minCP.x = cp[i].x;
                if (cp[i].y < minCP.y)
                    minCP.y = cp[i].y;
                if (cp[i].x > maxCP.x)
                    maxCP.x = cp[i].x;
                if (cp[i].y > maxCP.y)
                    maxCP.y = cp[i].y;
            }
            return [ minCP, maxCP ];
        }

        private hitTestWithBBox(p: Point, cp: Point[]): boolean
        {
            const mm = this.minMaxCP(cp);
            const minC = { x: mm[0].x - this.m_thickness, y: mm[0].y - this.m_thickness };
            const maxC = { x: mm[1].x + this.m_thickness, y: mm[1].y + this.m_thickness };
            return p.x >= minC.x && p.x <= maxC.x && p.y >= minC.y && p.y <= maxC.y;
        }

        private hitTestWithCurve(p: Point, cp: Point[]): boolean
        {
            if (cp.length === 3)
                return Geometry.distanceToQuadCurve(p, cp[0], cp[1], cp[2]) <= this.m_thickness;
            else
                return Geometry.distanceToBezierCurve(p, cp[0], cp[1], cp[2], cp[3]) <= this.m_thickness;
        }

        public hitTest(x: number, y: number): boolean
        {
            const p = { x: x, y: y };
            const cp = this.controlPoints();
            return this.hitTestWithBBox(p, cp) && this.hitTestWithCurve(p, cp);
        }

        public controlPoints(): Point[]
        {
            if (this.source === null) {
                const c1 = { x: this.m_cursorPos.x, y: this.m_cursorPos.y };
                const c2 = { x: 0.0, y: 0.0 };
                const c3 = { x: this.target.x, y: this.target.y };
                return [ c1, c2, c3 ];
            } else if (this.target === null) {
                const c1 = { x: this.source.x, y: this.source.y };
                const c2 = { x: 0.0, y: 0.0 };
                const c3 = { x: this.m_cursorPos.x, y: this.m_cursorPos.y };
                return [ c1, c2, c3 ];
            } else if (this.source === this.target) {
                const c1 = { x: this.source.x, y: this.source.y };
                const x1 = 0.0;
                const y1 = 0.0;
                const x2 = c1.x / 2.0;
                const y2 = c1.y / 2.0;
                const c2 = { x: x1 + y2, y: y1 - x2 };
                const c3 = { x: x1 - y2, y: y1 + x2 };
                return [ c1, c2, c3, c1 ];
            } else {
                const c1 = { x: this.source.x, y: this.source.y };
                const c2 = { x: 0.0, y: 0.0 };
                const c3 = { x: this.target.x, y: this.target.y };
                return [ c1, c2, c3 ];
            }
        }

        public setCursorPos(p: Point)
        {
            this.m_cursorPos = p;
        }
    }
}
