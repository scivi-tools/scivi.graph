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
        private m_enableLoop: boolean;

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
            this.m_enableLoop = false;
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

        private distanceToQuadCurve(p: Point, c1: Point, c2: Point, c3: Point): number
        {
            if (this.isDirected) {
                const xa = c2.x - c3.x;
                const ya = c2.y - c3.y;
                const l = Edge.maxThickness / Math.sqrt(xa * xa + ya * ya);
                const corrTo = { x: c3.x + xa * l, y: c3.y + ya * l };
                const curveDist = Geometry.distanceToQuadCurve(p, c1, c2, corrTo);
                const arrowDist = Geometry.distanceToLineSegment(p, corrTo, c3);
                return Math.min(curveDist, arrowDist);
            } else {
                return Geometry.distanceToQuadCurve(p, c1, c2, c3);
            }
        }

        private distanceToBezierCurve(p: Point, c1: Point, c2: Point, c3: Point, c4: Point): number
        {
            if (this.isDirected) {
                const xa = c3.x - c4.x;
                const ya = c3.y - c4.y;
                const l = Edge.maxThickness / Math.sqrt(xa * xa + ya * ya);
                const corrTo = { x: c4.x + xa * l, y: c4.y + ya * l };
                const curveDist = Geometry.distanceToBezierCurve(p, c1, c2, c3, corrTo);
                const arrowDist = Geometry.distanceToLineSegment(p, corrTo, c4);
                return Math.min(curveDist, arrowDist);
            } else {
                return Geometry.distanceToBezierCurve(p, c1, c2, c3, c4);
            }
        }

        private hitTestWithCurve(p: Point, cp: Point[]): boolean
        {
            if (cp.length === 3)
                return this.distanceToQuadCurve(p, cp[0], cp[1], cp[2]) <= this.m_thickness;
            else
                return this.distanceToBezierCurve(p, cp[0], cp[1], cp[2], cp[3]) <= this.m_thickness;
        }

        public hitTest(x: number, y: number): boolean
        {
            const p = { x: x, y: y };
            const cp = this.controlPoints();
            return this.hitTestWithBBox(p, cp) && this.hitTestWithCurve(p, cp);
        }

        private freeCP(a: Point, b: Point): Point
        {
            // A - from point, B - to point, O = {0,0}, C - desired control point to calculate
            const m = { x: (a.x + b.x) / 2.0, y: (a.y + b.y) / 2.0 }; // M = (A + B) / 2
            const distAM = Geometry.distance(a, m);
            const distAO = Math.sqrt(a.x * a.x + a.y * a.y);
            if (distAO < 0.001)
                return { x: 0.0, y: 0.0 }; // Not really a possible case, but beware anyway
            let distAC = distAO * distAM * distAM / (a.x * (a.x - m.x) + a.y * (a.y - m.y)); // |AC| = |AO|*|AM|*|AM| / AO.AM
            if (distAC < 0.0)
                distAC = 0.0;
            else if (distAC > distAO)
                distAC = distAO;
            return { x: a.x * (1.0 - distAC / distAO), y: a.y * (1.0 - distAC / distAO) }; // C = A + AO * |AC| / |AO|
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
                const c3 = { x: this.m_cursorPos.x, y: this.m_cursorPos.y };
                const c2 = this.freeCP(c1, c3);
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

        public assignTarget(tg: Node)
        {
            if (tg === this.source)
                this.target = this.m_enableLoop ? tg : null;
            else {
                this.m_enableLoop = true;
                this.target = tg;
            }
        }
    }
}
