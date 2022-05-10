namespace SciViCGraph
{
    export class HyperEdge
    {
        private m_fill: Polygon;
        private m_border: Curve;
        private m_needsUpdate: boolean;
        private m_visible: boolean;
        private m_highlight: HighlightType;
        private m_highlightSet: boolean;

        constructor(public nodes: Node[], public weight: number)
        {
            this.m_fill = null;
            this.m_border = null;
            this.m_needsUpdate = false;
            this.m_visible = true;
            this.m_highlight = HighlightType.None;
            this.m_highlightSet = false;
        }

        public prepare(): boolean
        {
            let result = false;
            if (this.m_needsUpdate) {
                this.update();
                this.m_needsUpdate = false;
                result = true;
            }
            if (!this.m_highlightSet)
                this.highlight = HighlightType.None;
            this.m_highlightSet = false;
            return result;
        }

        public addToScene(scene: Scene)
        {
            if (!this.m_fill)
                this.m_fill = new Polygon();
            if (!this.m_border)
                this.m_border = new Curve();
            scene.addChild(this.m_fill);
            scene.addChild(this.m_border);
            this.m_needsUpdate = true;
        }

        public setNeedsUpdate()
        {
            this.m_needsUpdate = true;
        }

        set visible(v: boolean)
        {
            if (v !== this.m_visible) {
                this.m_visible = v;
                this.setNeedsUpdate();
            }
        }

        get visible(): boolean
        {
            return this.m_visible;
        }

        set highlight(hl: HighlightType)
        {
            if (hl !== this.m_highlight) {
                this.m_highlight = hl;
                this.setNeedsUpdate();
                this.m_highlightSet = true;
            }
        }

        get highlight(): HighlightType
        {
            return this.m_highlight;
        }

        private controlPoint(from: Node, to: Node): Point
        {
            const h = 30.0;
            const ft = { x: to.x - from.x, y: to.y - from.y };
            const l = Math.sqrt(ft.x * ft.x + ft.y * ft.y);
            const c = { x: (from.x + to.x) / 2.0, y: (from.y + to.y) / 2.0 };
            return { x: -ft.y / l * h + c.x, y: ft.x / l * h + c.y };
        }

        private update()
        {
            if (this.m_border && this.nodes.length > 0) {
                const thickness = 2.0;

                let nodesToDraw = this.nodes.filter((node) => {
                    return node.visible;
                });
                nodesToDraw.sort((a, b) => {
                    return a.rotation < b.rotation ? -1 : a.rotation > b.rotation ? 1 : 0;
                });

                this.m_border.clear();
                this.m_border.lineStyle(thickness, 0x0, 1);
                this.m_fill.clear();

                const n = nodesToDraw.length;

                if (n > 1) {
                    for (let i = 0; i < n; ++i) {
                        const fromNode = nodesToDraw[i];
                        const toNode = nodesToDraw[(i + 1) % n];
                        const cp = this.controlPoint(fromNode, toNode);

                        let fromColor = null;
                        let toColor = null;
                        let alpha = 0;
                        switch (this.m_highlight)
                        {
                            case HighlightType.None: {
                                fromColor = Color.passiveColor(fromNode.groupColor);
                                toColor = Color.passiveColor(toNode.groupColor);
                                alpha = Edge.passiveEdgeAlpha;
                                break;
                            }

                            case HighlightType.Hover:
                            case HighlightType.Selection:
                            case HighlightType.Multiselect: {
                                fromColor = fromNode.groupColor;
                                toColor = toNode.groupColor;
                                alpha = Edge.hoveredEdgeAlpha;
                                break;
                            }
                        }

                        this.m_fill.addColor({ from: fromColor, to: toColor, alpha: alpha / 3.0 });
                        this.m_fill.moveTo(fromNode.x, fromNode.y);
                        this.m_fill.quadraticCurveWithArrowTo(cp.x, cp.y, toNode.x, toNode.y, 0.0, 0.0);
                        this.m_border.addColor({ from: fromColor, to: toColor, alpha: alpha });
                        this.m_border.moveTo(fromNode.x, fromNode.y);
                        this.m_border.quadraticCurveWithArrowTo(cp.x, cp.y, toNode.x, toNode.y, 0.0, 0.0);
                    }
                }

                switch (this.m_highlight) {
                    case HighlightType.None: {
                        this.m_border.bringToBack();
                        this.m_fill.bringToBack();
                        break;
                    }

                    case HighlightType.Hover:
                    case HighlightType.Selection:
                    case HighlightType.Multiselect: {
                        this.m_fill.bringToFront();
                        this.m_border.bringToFront();
                        break;
                    }
                }
            }
        }
    }
}
