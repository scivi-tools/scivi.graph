namespace SciViCGraph
{
    export class EqualizerItem
    {
        private m_nodeWeight: Range;
        private m_edgeWeight: Range;
        private m_highlight: RingScaleSegment;
        private m_div: JQuery;
        private m_hash: string;
        private m_nodeFilterSlider: FilterSlider;
        private m_edgeFilterSlider: FilterSlider;

        constructor(private m_renderer: Renderer,
                    segment: RingScaleSegment,
                    private m_ringIndex: number)
        {
            this.m_highlight = segment.doCopy();

            this.calcWeights();
            this.addInterface();
        }

        public setWeights(nodeW: Range, edgeW: Range)
        {
            this.m_nodeWeight = nodeW;
            this.m_edgeWeight = edgeW;

            this.m_nodeFilterSlider.setValues(this.m_nodeWeight);
            this.m_edgeFilterSlider.setValues(this.m_edgeWeight);
        }

        public matchesRanges(nodeW: Range, edgeW: Range): boolean
        {
            return nodeW.min === this.m_nodeWeight.min && nodeW.max === this.m_nodeWeight.max &&
                   edgeW.min === this.m_edgeWeight.min && edgeW.max === this.m_edgeWeight.max;
        }

        private containsNode(node: Node): boolean
        {
            return this.m_highlight.containsAngle(node.rotation);
        }

        private calcWeights()
        {
            this.m_nodeWeight = { min: undefined, max: undefined };
            this.m_edgeWeight = { min: undefined, max: undefined };

            Object.keys(this.m_renderer.states.data).forEach((dataKey) => {
                const data = this.m_renderer.states.data[dataKey];
                for (let i = 0, n = data.nodes.length; i < n; ++i) {
                    if (this.containsNode(data.nodes[i])) {
                        if (this.m_nodeWeight.min === undefined || this.m_nodeWeight.min > data.nodes[i].weight)
                            this.m_nodeWeight.min = data.nodes[i].weight;
                        if (this.m_nodeWeight.max === undefined || this.m_nodeWeight.max < data.nodes[i].weight)
                            this.m_nodeWeight.max = data.nodes[i].weight;
                    }
                }
                for (let i = 0, n = data.edges.length; i < n; ++i) {
                    if (this.containsNode(data.edges[i].target) || this.containsNode(data.edges[i].source)) {
                        if (this.m_edgeWeight.min === undefined || this.m_edgeWeight.min > data.edges[i].weight)
                            this.m_edgeWeight.min = data.edges[i].weight;
                        if (this.m_edgeWeight.max === undefined || this.m_edgeWeight.max < data.edges[i].weight)
                            this.m_edgeWeight.max = data.edges[i].weight;
                    }
                }
            });

            if (this.m_nodeWeight.min === undefined)
                this.m_nodeWeight.min = 0.0;
            if (this.m_nodeWeight.max === undefined)
                this.m_nodeWeight.max = 0.0;

            if (this.m_edgeWeight.min === undefined)
                this.m_edgeWeight.min = 0.0;
            if (this.m_edgeWeight.max === undefined)
                this.m_edgeWeight.max = 0.0;
        }

        private addInterface()
        {
            this.m_hash = this.m_highlight.fromAngle.toString().replace(".", "-") + "_" +
                          this.m_highlight.toAngle.toString().replace(".", "-") + "_" +
                          this.m_highlight.radius.toString().replace(".", "-");
            const nodeFilterSliderID = "scivi_node_treshold_" + this.m_hash;
            const edgeFilterSliderID = "scivi_edge_treshold_" + this.m_hash;
            this.m_div = $("<div>", { id: "scivi_equalizer_item_" + this.m_hash });
            this.m_div.html("<div><div align='center'><div style='background-color: " +
                            color2string(this.m_highlight.color) +
                            "; color: " +
                            color2string(this.m_highlight.textColor) +
                            "; border-radius: 10px; margin-bottom: 10px; display: inline-block; width: 90%;'><b>" +
                            this.m_highlight.name +
                            "</b></div><div class='scivi_remove' id='scivi_equalizer_remove_" + this.m_hash + "'>X</div></div>" +
                            "<div id='" + nodeFilterSliderID + "'></div><div id='" + edgeFilterSliderID + "'></div>" +
                            "<hr/><br/>");
            $("#scivi_equalizer").append(this.m_div);
            this.m_nodeFilterSlider = new FilterSlider("#" + nodeFilterSliderID, this.m_renderer.localizer["LOC_NODES"],
                                                       this.m_nodeWeight.min, this.m_nodeWeight.max,
                                                       this.m_nodeWeight.min, this.m_nodeWeight.max,
                                                       this.m_renderer.maxNumberOfNodes * 2, // Heurisrics
                                                       (fromVal: number, toVal: number) => { this.changeNodesTreshold(fromVal, toVal); });

            this.m_edgeFilterSlider = new FilterSlider("#" + edgeFilterSliderID, this.m_renderer.localizer["LOC_EDGES"],
                                                       this.m_edgeWeight.min, this.m_edgeWeight.max,
                                                       this.m_edgeWeight.min, this.m_edgeWeight.max,
                                                       this.m_renderer.maxNumberOfEdges * 2, // Heurisrics
                                                       (fromVal: number, toVal: number) => { this.changeEdgesTreshold(fromVal, toVal); });
            $("#scivi_equalizer_remove_" + this.m_hash).click(() => {
                this.m_div.remove();
                this.m_renderer.removeEqualizerItem(this);
            });
            if ($("#scivi_cgraph_tabs").length)
                $("#scivi_cgraph_tabs").tabs("option", "active", 3);
            $("#scivi_equalizer_item_" + this.m_hash)[0].scrollIntoView();
        }

        private changeNodesTreshold(fromVal: number, toVal: number)
        {
            this.m_nodeWeight.min = fromVal;
            this.m_nodeWeight.max = toVal;
            this.m_renderer.updateNodesVisibility();
        }

        private changeEdgesTreshold(fromVal: number, toVal: number)
        {
            this.m_edgeWeight.min = fromVal;
            this.m_edgeWeight.max = toVal;
            this.m_renderer.updateEdgesVisibility();
        }

        public matches(segment: RingScaleSegment): boolean
        {
            return this.m_highlight.matches(segment);
        }

        public harakiri()
        {
            this.m_div.remove();
        }

        public hidesNode(node: Node): boolean
        {
            return this.containsNode(node) &&
                   (node.weight < this.m_nodeWeight.min || node.weight > this.m_nodeWeight.max);
        }

        public hidesEdge(edge: Edge): boolean
        {
            return (this.containsNode(edge.source) || this.containsNode(edge.target)) &&
                   (edge.weight < this.m_edgeWeight.min || edge.weight > this.m_edgeWeight.max);
        }

        public dumpFilterCode(fc: EqualizerCode[])
        {
            fc.push({
                ringIndex: this.m_ringIndex,
                segmentHash: this.m_highlight.segmentHash,
                nodes: this.m_nodeWeight,
                edges: this.m_edgeWeight
            });
        }
    }
}
