namespace SciViCGraph
{
    export class EqualizerItem
    {
        private m_nodeWeight: Range;
        private m_edgeWeight: Range;
        private m_highlight: RingScaleSegment;
        private m_div: any;

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
            const idx = this.m_highlight.fromAngle.toString().replace(".", "-") + "_" +
                        this.m_highlight.toAngle.toString().replace(".", "-") + "_" +
                        this.m_highlight.radius.toString().replace(".", "-");
            this.m_div = $("<div>", { id: "scivi_equalizer_item_" + idx });
            this.m_div.html("<div><div align='center'><div style='background-color: " +
                            color2string(this.m_highlight.color) +
                            "; color: " +
                            color2string(this.m_highlight.textColor) +
                            "; border-radius: 10px; margin-bottom: 10px; display: inline-block; width: 90%;'><b>" +
                            this.m_highlight.name +
                            "</b></div><div class='scivi_remove' id='scivi_equalizer_remove_" + idx + "'>X</div></div>" +

                            "<div>" + this.m_renderer.localizer["LOC_NODES"] +
                            ":&nbsp;<span id='scivi_node_treshold_" + idx + "'>" +
                            this.m_renderer.roundValS(this.m_nodeWeight.min, this.m_nodeWeight.step) + " .. " +
                            this.m_renderer.roundValS(this.m_nodeWeight.max, this.m_nodeWeight.step) +
                            "</span></div>" +
                            "<div id='scivi_node_treshold_slider_" + idx +
                            "' style='margin: 10px 10px 10px 5px'></div>" +

                            "<div>" + this.m_renderer.localizer["LOC_EDGES"] +
                            ":&nbsp;<span id='scivi_edge_treshold_" + idx + "'>" +
                            this.m_renderer.roundValS(this.m_edgeWeight.min, this.m_edgeWeight.step) + " .. " +
                            this.m_renderer.roundValS(this.m_edgeWeight.max, this.m_edgeWeight.step) +
                            "</span></div>" +
                            "<div id='scivi_edge_treshold_slider_" + idx +
                            "' style='margin: 10px 10px 10px 5px'></div><hr/><br/>");
            $("#scivi_equalizer").append(this.m_div);
            $("#scivi_node_treshold_slider_" + idx).slider({
                min: this.m_nodeWeight.min,
                max: this.m_nodeWeight.max,
                range: true,
                values: [this.m_nodeWeight.min, this.m_nodeWeight.max],
                step: this.m_nodeWeight.step,
                slide: (event, ui) => {  } // FIXME
            });
            $("#scivi_edge_treshold_slider_" + idx).slider({
                min: this.m_edgeWeight.min,
                max: this.m_edgeWeight.max,
                range: true,
                values: [this.m_edgeWeight.min, this.m_edgeWeight.max],
                step: this.m_edgeWeight.step,
                slide: (event, ui) => {  } // FIXME
            });
            $("#scivi_equalizer_remove_" + idx)[0].onclick = () => {
                this.m_div.remove();
                this.m_renderer.removeEqualizerItem(this);
            };
            if ($("#scivi_cgraph_tabs").length)
                $("#scivi_cgraph_tabs").tabs("option", "active", 3);
            $("#scivi_equalizer_item_" + idx)[0].scrollIntoView();
        }

        public matches(segment: RingScaleSegment): boolean
        {
            return this.m_highlight.matches(segment);
        }

        public harakiri()
        {
            this.m_div.remove();
        }
    }
}
