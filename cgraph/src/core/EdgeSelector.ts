namespace SciViCGraph
{
    export class EdgeSelector
    {
        private m_edges: Edge[];
        private m_hyperEdges: HyperEdge[];
        private m_hoveredEdge: Edge;
        private m_selectedEdge: Edge;
        private m_hoveredHyperEdge: HyperEdge;
        private m_selectedHyperEdge: HyperEdge;
        private m_orphanedMode: boolean

        constructor(private m_svRenderer: Renderer)
        {
            this.m_edges = [];
            this.m_hyperEdges = [];
            this.m_hoveredEdge = null;
            this.m_selectedEdge = null;
            this.m_hoveredHyperEdge = null;
            this.m_selectedHyperEdge = null;
            this.m_orphanedMode = false;
        }

        get edges(): Edge[]
        {
            return this.m_edges;
        }

        set edges(edgesArr: Edge[])
        {
            this.m_edges = edgesArr;
        }

        get hyperEdges(): HyperEdge[]
        {
            return this.m_hyperEdges;
        }

        set hyperEdges(hyperEdgesArr: HyperEdge[])
        {
            this.m_hyperEdges = hyperEdgesArr;
        }

        private getEdgeByPosition(x: number, y: number, s: number): Edge
        {
            if (isNaN(x) || isNaN(y))
                return null;
            const d = x * x + y * y;
            const r = this.m_svRenderer.radius;
            const inRing = r * r * s * s;
            if (d < inRing) {
                for (let i = this.m_edges.length - 1; i >= 0; --i) {
                    if (this.m_edges[i].visible && this.m_edges[i].hitTest(x / s, y / s))
                        return this.m_edges[i];
                }
            }
            return null;
        }

        private getHyperEdgeByPosition(x: number, y: number, s: number): HyperEdge
        {
            if (isNaN(x) || isNaN(y))
                return null;
            const d = x * x + y * y;
            const r = this.m_svRenderer.radius;
            const inRing = r * r * s * s;
            if (d < inRing) {
                for (let i = this.hyperEdges.length - 1; i >= 0; --i) {
                    if (this.hyperEdges[i].visible && this.hyperEdges[i].hitTest(x / s, y / s))
                        return this.hyperEdges[i];
                }
            }
            return null;
        }

        private hoverEdge(edge: Edge, select: boolean)
        {
            if (!this.m_orphanedMode)
                edge.isGlowing = select;
        }

        private hoverHyperEdge(hyperEdge: HyperEdge, select: boolean)
        {
            if (!this.m_orphanedMode)
                hyperEdge.isGlowing = select;
        }

        public handleCursorMove(x: number, y: number, s: number, gx: number, gy: number): boolean
        {
            let hoveredEdge = this.getEdgeByPosition(x, y, s);
            const offset = 20;
            if (hoveredEdge) {
                if (this.m_hoveredEdge !== hoveredEdge) {
                    if (this.m_hoveredEdge && this.m_hoveredEdge !== this.m_selectedEdge)
                        this.hoverEdge(this.m_hoveredEdge, false);
                    if (this.m_hoveredHyperEdge && this.m_hoveredHyperEdge !== this.m_selectedHyperEdge) {
                        this.hoverHyperEdge(this.m_hoveredHyperEdge, false);
                        this.m_hoveredHyperEdge = null;
                    }
                    this.m_hoveredEdge = hoveredEdge;
                    this.hoverEdge(this.m_hoveredEdge, true);
                    if (this.m_hoveredEdge.tooltip)
                        $(".scivi_graph_tooltip").html(this.m_hoveredEdge.tooltip);
                    else
                        $(".scivi_graph_tooltip").html(this.m_hoveredEdge.weight.toString());
                    $(".scivi_graph_tooltip").css({top: gy, left: gx + offset});
                    $(".scivi_graph_tooltip").stop(true);
                    $(".scivi_graph_tooltip").fadeIn(100);
                    $(".scivi_graph_tooltip")[0]["host"] = this;
                    return true;
                }
                $(".scivi_graph_tooltip").css({top: gy, left: gx + offset, position: "absolute"});
                return false;
            } else {
                if (this.m_hoveredEdge) {
                    if (this.m_hoveredEdge !== this.m_selectedEdge)
                        this.hoverEdge(this.m_hoveredEdge, false);
                    this.m_hoveredEdge = null;
                    if ($(".scivi_graph_tooltip")[0]["host"] === this) {
                        $(".scivi_graph_tooltip").stop(true);
                        $(".scivi_graph_tooltip").fadeOut(100);
                    }
                    return true;
                }

                let hoveredHyperEdge = this.getHyperEdgeByPosition(x, y, s);
                if (hoveredHyperEdge) {
                    if (this.m_hoveredHyperEdge !== hoveredHyperEdge) {
                        if (this.m_hoveredHyperEdge && this.m_hoveredHyperEdge !== this.m_selectedHyperEdge)
                            this.hoverHyperEdge(this.m_hoveredHyperEdge, false);
                        this.m_hoveredHyperEdge = hoveredHyperEdge;
                        this.hoverHyperEdge(this.m_hoveredHyperEdge, true);
                        if (this.m_hoveredHyperEdge.tooltip)
                            $(".scivi_graph_tooltip").html(this.m_hoveredHyperEdge.tooltip);
                        else
                            $(".scivi_graph_tooltip").html(this.m_hoveredHyperEdge.weight.toString());
                        $(".scivi_graph_tooltip").css({top: gy, left: gx + offset});
                        $(".scivi_graph_tooltip").stop(true);
                        $(".scivi_graph_tooltip").fadeIn(100);
                        $(".scivi_graph_tooltip")[0]["host"] = this;
                        return true;
                    }
                    $(".scivi_graph_tooltip").css({top: gy, left: gx + offset, position: "absolute"});
                    return false;
                } else {
                    if (this.m_hoveredHyperEdge) {
                        if (this.m_hoveredHyperEdge !== this.m_selectedHyperEdge)
                            this.hoverHyperEdge(this.m_hoveredHyperEdge, false);
                        this.m_hoveredHyperEdge = null;
                        if ($(".scivi_graph_tooltip")[0]["host"] === this) {
                            $(".scivi_graph_tooltip").stop(true);
                            $(".scivi_graph_tooltip").fadeOut(100);
                        }
                        return true;
                    }
                }
            }
            return false;
        }

        public handleClick(): boolean
        {
            let result = false;

            if (this.m_hoveredEdge) {
                if (this.m_selectedEdge === this.m_hoveredEdge) {
                    // this.m_selectedEdge = null;
                } else {
                    if (this.m_selectedEdge) {
                        this.m_selectedEdge.isGlowing = false;
                    }
                    this.m_selectedEdge = this.m_hoveredEdge;
                    if (this.m_selectedHyperEdge && this.m_selectedHyperEdge === this.m_hoveredHyperEdge) {
                        this.m_selectedHyperEdge.isGlowing = false;
                        this.m_selectedHyperEdge = null;
                        this.m_hoveredHyperEdge = null;
                    }
                }
                result = true;
            } else {
                if (this.m_selectedEdge) {
                    this.m_selectedEdge.isGlowing = false;
                    this.m_selectedEdge = null;
                    result = true;
                }
            }

            if (this.m_hoveredHyperEdge) {
                if (this.m_selectedHyperEdge === this.m_hoveredHyperEdge) {
                    // this.m_selectedHyperEdge = null;
                } else {
                    if (this.m_selectedHyperEdge) {
                        this.m_selectedHyperEdge.isGlowing = false;
                    }
                    this.m_selectedHyperEdge = this.m_hoveredHyperEdge;
                }
                result = true;
            } else {
                if (this.m_selectedHyperEdge) {
                    this.m_selectedHyperEdge.isGlowing = false;
                    this.m_selectedHyperEdge = null;
                    result = true;
                }
            }

            return result;
        }

        get selectedEdge(): Edge
        {
            return this.m_selectedEdge;
        }

        get selectedHyperEdge(): HyperEdge
        {
            return this.m_selectedHyperEdge;
        }

        public deleteSelectedEdge()
        {
            this.m_selectedEdge = null;
            this.m_hoveredEdge = null;
            if ($(".scivi_graph_tooltip")[0]["host"] === this) {
                $(".scivi_graph_tooltip").stop(true);
                $(".scivi_graph_tooltip").fadeOut(100);
            }
        }

        public deleteSelectedHyperEdge()
        {
            this.m_selectedHyperEdge = null;
            this.m_hoveredHyperEdge = null;
            if ($(".scivi_graph_tooltip")[0]["host"] === this) {
                $(".scivi_graph_tooltip").stop(true);
                $(".scivi_graph_tooltip").fadeOut(100);
            }
        }

        public updateEdgeTooltip()
        {
            if (this.m_selectedEdge) {
                if (this.m_selectedEdge.tooltip)
                    $(".scivi_graph_tooltip").html(this.m_selectedEdge.tooltip);
                else
                    $(".scivi_graph_tooltip").html(this.m_selectedEdge.weight.toString());
            } else if (this.m_selectedHyperEdge) {
                if (this.m_selectedHyperEdge.tooltip)
                    $(".scivi_graph_tooltip").html(this.m_selectedHyperEdge.tooltip);
                else
                    $(".scivi_graph_tooltip").html(this.m_selectedHyperEdge.weight.toString());
            }
        }

        public clearSelected()
        {
            this.handleCursorMove(NaN, NaN, NaN, NaN, NaN);
            this.handleClick();
        }

        set orphanedMode(om: boolean)
        {
            this.m_orphanedMode = om;
        }

        public prepare(): boolean
        {
            let result = false;
            if (this.m_orphanedMode) {
                if (this.m_hoveredEdge) {
                    if (this.m_hoveredEdge.highlight === HighlightType.None) {
                        this.m_hoveredEdge.highlight = HighlightType.Hover;
                        result = true;
                    }
                    if (this.m_hoveredEdge.source.highlight === HighlightType.None) {
                        this.m_hoveredEdge.source.highlight = HighlightType.Hover;
                        result = true;
                    }
                    if (this.m_hoveredEdge.target.highlight === HighlightType.None) {
                        this.m_hoveredEdge.target.highlight = HighlightType.Hover;
                        result = true;
                    }
                }
                if (this.m_selectedEdge) {
                    if (this.m_selectedEdge.highlight === HighlightType.None) {
                        this.m_selectedEdge.highlight = HighlightType.Hover;
                        result = true;
                    }
                    if (this.m_selectedEdge.source.highlight === HighlightType.None) {
                        this.m_selectedEdge.source.highlight = HighlightType.Hover;
                        result = true;
                    }
                    if (this.m_selectedEdge.target.highlight === HighlightType.None) {
                        this.m_selectedEdge.target.highlight = HighlightType.Hover;
                        result = true;
                    }
                    if (!this.m_selectedEdge.isGlowing) {
                        this.m_selectedEdge.isGlowing = true;
                        result = true;
                    }
                    if (this.m_selectedEdge.isGlowing)
                        this.m_selectedEdge.resetBatchMove();
                }
            }
            return result;
        }
    }
}
