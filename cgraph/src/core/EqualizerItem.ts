namespace SciViCGraph
{
    export class EqualizerItem
    {
        private m_nodeWeight: Range;
        private m_edgeWeight: Range;
        private m_highlight: RingScaleSegment;
        private m_div: JQuery;
        private m_hash: string;

        constructor(private m_renderer: Renderer, segment: RingScaleSegment)
        {
            this.m_highlight = segment.doCopy();

            this.calcWeights();
            this.addInterface();
        }

        private containsNode(node: Node): boolean
        {
            return this.m_highlight.containsAngle(node.rotation);
        }

        private calcWeights()
        {
            this.m_nodeWeight = { min: undefined, max: undefined, step: undefined };
            this.m_edgeWeight = { min: undefined, max: undefined, step: undefined };

            this.m_renderer.data.forEach((data) => {
                for (let i = 0, n = data.nodes.length; i < n; ++i) {
                    if (this.containsNode(data.nodes[i])) {
                        if (this.m_nodeWeight.min === undefined || this.m_nodeWeight.min > data.nodes[i].weight)
                            this.m_nodeWeight.min = data.nodes[i].weight;
                        if (this.m_nodeWeight.max === undefined || this.m_nodeWeight.max < data.nodes[i].weight)
                            this.m_nodeWeight.max = data.nodes[i].weight;
                        for (let j = i + 1; j < n; ++j) {
                            const d = Math.abs(data.nodes[i].weight - data.nodes[j].weight);
                            if (d > 0.0 && (this.m_nodeWeight.step === undefined || this.m_nodeWeight.step > d))
                                this.m_nodeWeight.step = d;
                        }
                    }
                }
                for (let i = 0, n = data.edges.length; i < n; ++i) {
                    if (this.containsNode(data.edges[i].target) || this.containsNode(data.edges[i].source)) {
                        if (this.m_edgeWeight.min === undefined || this.m_edgeWeight.min > data.edges[i].weight)
                            this.m_edgeWeight.min = data.edges[i].weight;
                        if (this.m_edgeWeight.max === undefined || this.m_edgeWeight.max < data.edges[i].weight)
                            this.m_edgeWeight.max = data.edges[i].weight;
                        for (let j = i + 1; j < n; ++j) {
                            const d = Math.abs(data.edges[i].weight - data.edges[j].weight);
                            if (d > 0.0 && (this.m_edgeWeight.step === undefined || this.m_edgeWeight.step > d))
                                this.m_edgeWeight.step = d;
                        }
                    }
                }
            });

            if (this.m_nodeWeight.min === undefined) {
                this.m_nodeWeight.min = 0.0;
                this.m_nodeWeight.max = 0.0;
                this.m_nodeWeight.step = 0.0;
            } else if (this.m_nodeWeight.step === undefined) {
                this.m_nodeWeight.step = 0.0;
            }

            if (this.m_edgeWeight.min === undefined) {
                this.m_edgeWeight.min = 0.0;
                this.m_edgeWeight.max = 0.0;
                this.m_edgeWeight.step = 0.0;
            } else if (this.m_edgeWeight.step === undefined) {
                this.m_edgeWeight.step = 0.0;
            }
        }

        private addInterface()
        {
            this.m_hash = this.m_highlight.fromAngle.toString().replace(".", "-") + "_" +
                          this.m_highlight.toAngle.toString().replace(".", "-") + "_" +
                          this.m_highlight.radius.toString().replace(".", "-");
            this.m_div = $("<div>", { id: "scivi_equalizer_item_" + this.m_hash });
            this.m_div.html("<div><div align='center'><div style='background-color: " +
                            color2string(this.m_highlight.color) +
                            "; color: " +
                            color2string(this.m_highlight.textColor) +
                            "; border-radius: 10px; margin-bottom: 10px; display: inline-block; width: 90%;'><b>" +
                            this.m_highlight.name +
                            "</b></div><div class='scivi_remove' id='scivi_equalizer_remove_" + this.m_hash + "'>X</div></div>" +

                            "<div>" + this.m_renderer.localizer["LOC_NODES"] +
                            ":&nbsp;<span id='scivi_node_treshold_" + this.m_hash + "'>" +
                            this.m_renderer.roundValS(this.m_nodeWeight.min, this.m_nodeWeight.step) + " .. " +
                            this.m_renderer.roundValS(this.m_nodeWeight.max, this.m_nodeWeight.step) +
                            "</span></div>" +
                            "<div id='scivi_node_treshold_slider_" + this.m_hash +
                            "' style='margin: 10px 10px 10px 5px'></div>" +

                            "<div>" + this.m_renderer.localizer["LOC_EDGES"] +
                            ":&nbsp;<span id='scivi_edge_treshold_" + this.m_hash + "'>" +
                            this.m_renderer.roundValS(this.m_edgeWeight.min, this.m_edgeWeight.step) + " .. " +
                            this.m_renderer.roundValS(this.m_edgeWeight.max, this.m_edgeWeight.step) +
                            "</span></div>" +
                            "<div id='scivi_edge_treshold_slider_" + this.m_hash +
                            "' style='margin: 10px 10px 10px 5px'></div><hr/><br/>");
            $("#scivi_equalizer").append(this.m_div);
            $("#scivi_node_treshold_slider_" + this.m_hash).slider({
                min: this.m_nodeWeight.min,
                max: this.m_nodeWeight.max,
                range: true,
                values: [this.m_nodeWeight.min, this.m_nodeWeight.max],
                step: this.m_nodeWeight.step,
                slide: (event, ui) => { this.changeNodesTreshold(ui.values); }
            });
            $("#scivi_edge_treshold_slider_" + this.m_hash).slider({
                min: this.m_edgeWeight.min,
                max: this.m_edgeWeight.max,
                range: true,
                values: [this.m_edgeWeight.min, this.m_edgeWeight.max],
                step: this.m_edgeWeight.step,
                slide: (event, ui) => { this.changeEdgesTreshold(ui.values); }
            });
            $("#scivi_equalizer_remove_" + this.m_hash).click(() => {
                this.m_div.remove();
                this.m_renderer.removeEqualizerItem(this);
            });
            if ($("#scivi_cgraph_tabs").length)
                $("#scivi_cgraph_tabs").tabs("option", "active", 3);
            $("#scivi_equalizer_item_" + this.m_hash)[0].scrollIntoView();
        }

        private changeNodesTreshold(values: number[])
        {
             $("#scivi_node_treshold_" + this.m_hash).text(this.m_renderer.roundValS(values[0], this.m_edgeWeight.step) +
                                                           " .. " +
                                                           this.m_renderer.roundValS(values[1], this.m_edgeWeight.step));
            this.m_nodeWeight.min = values[0];
            this.m_nodeWeight.max = values[1];
            this.m_renderer.equalizeNodes();
        }

        private changeEdgesTreshold(values: number[])
        {
            $("#scivi_edge_treshold_" + this.m_hash).text(this.m_renderer.roundValS(values[0], this.m_edgeWeight.step) +
                                                          " .. " +
                                                          this.m_renderer.roundValS(values[1], this.m_edgeWeight.step));
            this.m_edgeWeight.min = values[0];
            this.m_edgeWeight.max = values[1];
            this.m_renderer.equalizeEdges();
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
            const th = this.m_nodeWeight.step / 2.0;
            return this.containsNode(node) &&
                   (node.weight < this.m_nodeWeight.min - th || node.weight > this.m_nodeWeight.max + th);
        }

        public hidesEdge(edge: Edge): boolean
        {
            const th = this.m_edgeWeight.step / 2.0;
            return (this.containsNode(edge.source) || this.containsNode(edge.target)) &&
                   (edge.weight < this.m_edgeWeight.min - th || edge.weight > this.m_edgeWeight.max + th);
        }
    }
}
