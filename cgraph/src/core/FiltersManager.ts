namespace SciViCGraph
{
    export type Range = { min: number, max: number };
    export type EqualizerCode = { ringIndex: number, segmentHash: string, nodes: Range, edges: Range };
    export type FilterSettings = { name: string, main: { nodes: Range, edges: Range }, scaleLevelsOrder: number[], equalizer: EqualizerCode[] };

    export class FiltersManager
    {
        private m_nodeWeight: Range;
        private m_edgeWeight: Range;
        private m_equalizer: EqualizerItem[];
        private m_edgeFilterSlider: FilterSlider;
        private m_nodeFilterSlider: FilterSlider;
        private m_maxNumberOfNodes: number;
        private m_maxNumberOfEdges: number;

        constructor(private m_renderer: Renderer,
                    private m_filters: HTMLElement)
        {
            this.m_nodeWeight = { min: undefined, max: undefined };
            this.m_edgeWeight = { min: undefined, max: undefined };
            this.m_equalizer = [];
            this.m_edgeFilterSlider = null;
            this.m_nodeFilterSlider = null;
            this.m_maxNumberOfNodes = 0;
            this.m_maxNumberOfEdges = 0;
        }

        get nodeWeight(): Range
        {
            return this.m_nodeWeight;
        }

        get edgeWeight(): Range
        {
            return this.m_edgeWeight;
        }

        get maxNumberOfNodes(): number
        {
            return this.m_maxNumberOfNodes;
        }

        get maxNumberOfEdges(): number
        {
            return this.m_maxNumberOfEdges;
        }

        get equalizer(): EqualizerItem[]
        {
            return this.m_equalizer;
        }

        public calcWeights()
        {
            this.m_nodeWeight = { min: undefined, max: undefined };
            this.m_edgeWeight = { min: undefined, max: undefined };
            this.m_maxNumberOfNodes = 0;
            this.m_maxNumberOfEdges = 0;

            Object.keys(this.m_renderer.states.data).forEach((dataKey) => {
                const data = this.m_renderer.states.data[dataKey];
                const nc = data.nodes.length;
                const ec = data.edges.length;
                const angleStep = 2.0 * Math.PI / nc;

                if (nc > this.m_maxNumberOfNodes)
                    this.m_maxNumberOfNodes = nc;
                if (ec > this.m_maxNumberOfEdges)
                    this.m_maxNumberOfEdges = ec;

                for (let i = 0; i < nc; ++i) {
                    if (this.m_nodeWeight.min === undefined || this.m_nodeWeight.min > data.nodes[i].weight)
                        this.m_nodeWeight.min = data.nodes[i].weight;
                    if (this.m_nodeWeight.max === undefined || this.m_nodeWeight.max < data.nodes[i].weight)
                        this.m_nodeWeight.max = data.nodes[i].weight;
                    data.nodes[i].rotation = i * angleStep;
                }

                for (let i = 0; i < ec; ++i) {
                    if (this.m_edgeWeight.min === undefined || this.m_edgeWeight.min > data.edges[i].weight)
                        this.m_edgeWeight.min = data.edges[i].weight;
                    if (this.m_edgeWeight.max === undefined || this.m_edgeWeight.max < data.edges[i].weight)
                        this.m_edgeWeight.max = data.edges[i].weight;
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

        public initFilters()
        {
            if (!this.m_filters)
                return;

            this.m_equalizer = [];

            this.m_filters.innerHTML =
                "<div style='margin: 5px 0px 5px 0px;'>" + this.m_renderer.localizer["LOC_FILTER_SET"] +
                "<div class='scivi_dropdown'><input type='text' id='scivi_filter_set_name'/><select id='scivi_filter_sets'></select></div>" + 
                "<div class='scivi_button' id='scivi_add_filter_set'>" + this.m_renderer.localizer["LOC_ADD_FILTER_SET"] + "</div>" + 
                "<div class='scivi_button' id='scivi_rem_filter_set'>" + this.m_renderer.localizer["LOC_REM_FILTER_SET"] + "</div>" + 
                "<div class='scivi_button' id='scivi_save_filter_set'>" + this.m_renderer.localizer["LOC_SAVE_FILTER_SET"] + "</div>" + 
                "</div><hr/><br/>" +
                "<div id='scivi_node_treshold'></div><div id='scivi_edge_treshold'></div><hr/><br/>" +
                "<div id='scivi_equalizer'></div>";

            this.m_nodeFilterSlider = new FilterSlider("#scivi_node_treshold", this.m_renderer.localizer["LOC_NODETHRESHOLD"],
                                                       this.m_nodeWeight.min, this.m_nodeWeight.max,
                                                       this.m_nodeWeight.min, this.m_nodeWeight.max,
                                                       this.m_maxNumberOfNodes * 2, // Heuristics
                                                       (fromVal: number, toVal: number) => { this.changeNodeTreshold(fromVal, toVal); });

            this.m_edgeFilterSlider = new FilterSlider("#scivi_edge_treshold", this.m_renderer.localizer["LOC_EDGETHRESHOLD"],
                                                       this.m_edgeWeight.min, this.m_edgeWeight.max,
                                                       this.m_edgeWeight.min, this.m_edgeWeight.max,
                                                       this.m_maxNumberOfEdges * 2, // Heuristics
                                                       (fromVal: number, toVal: number) => { this.changeEdgeTreshold(fromVal, toVal); });

            $("#scivi_add_filter_set").click(() => {
                let fs = $("#scivi_filter_sets");
                let i = fs.children("option").length;
                let k = "Filter set " + (i + 1);
                let fj = JSON.parse(JSON.stringify(this.dumpFilterSet()));
                let fk = "scivi_filter_set_" + i;
                fs.append($("<option>", { value: i, text: k, id: fk }));
                fs.val(i);
                $("#scivi_filter_set_name").val(k);
                $("#" + fk).data("fcode", fj);
            });

            $("#scivi_rem_filter_set").click(() => {
                let fi = $("#scivi_filter_set_" + $("#scivi_filter_sets").val());
                if (fi.length > 0) {
                    fi.remove();
                    fi = $("#scivi_filter_set_" + $("#scivi_filter_sets").val());
                    if (fi.length > 0)
                        $("#scivi_filter_set_name").val(fi.text());
                    else
                        $("#scivi_filter_set_name").val("");
                }
            });

            $("#scivi_save_filter_set").click(() => {
                this.saveFilterSet();
            });

            $("#scivi_filter_sets").change(() => {
                let fi = $("#scivi_filter_set_" + $("#scivi_filter_sets").val());
                $("#scivi_filter_set_name").val(fi.text());
                this.applyFilterSet(fi.data("fcode"));
            });

            $("#scivi_filter_set_name").change(() => {
                let fi = $("#scivi_filter_set_" + $("#scivi_filter_sets").val());
                if (fi.length > 0)
                    fi.text($("#scivi_filter_set_name").val());
                else
                    $("#scivi_filter_set_name").val("");
            });
        }

        public changeEdgeTreshold(fromVal: number, toVal: number)
        {
            this.m_edgeWeight.min = fromVal;
            this.m_edgeWeight.max = toVal;
            this.m_renderer.updateEdgesVisibility();
        }

        public changeNodeTreshold(fromVal: number, toVal: number)
        {
            this.m_nodeWeight.min = fromVal;
            this.m_nodeWeight.max = toVal;
            this.m_renderer.updateNodesVisibility();
        }

        public validateCurrentFilterSet()
        {
            if (!this.currentFilterSetValid()) {
                $("#scivi_filter_sets").val(-1);
                $("#scivi_filter_set_name").val("");
            }
        }

        private currentFilterSetValid(): boolean
        {
            let fi = $("#scivi_filter_set_" + $("#scivi_filter_sets").val());
            if (fi.length > 0) {
                let fj = fi.data("fcode");
                if (fj.main.nodes.min !== this.m_nodeWeight.min || fj.main.nodes.max !== this.m_nodeWeight.max ||
                    fj.main.edges.min !== this.m_edgeWeight.min || fj.main.edges.max !== this.m_edgeWeight.max)
                    return false;
                for (let i = 0, n = this.m_renderer.scaleLevels.length; i < n; ++i) {
                    if (this.m_renderer.scaleLevels[i].id !== fj.scaleLevelsOrder[i])
                        return false;
                }
                if (this.m_equalizer.length !== fj.equalizer.length)
                    return false;
                for (let i = 0, n = this.m_equalizer.length; i < n; ++i) {
                    if (!this.m_equalizer[i].matchesRanges(fj.equalizer[i].nodes, fj.equalizer[i].edges))
                        return false;
                }
            }
            return true;
        }

        private dumpFilterSet(): FilterSettings
        {
            let scaleLevelsOrder = [];
            this.m_renderer.scaleLevels.forEach((sl: Scale) => {
                scaleLevelsOrder.push(sl.id);
            });
            let equalizer = [];
            this.m_equalizer.forEach((eq: EqualizerItem) => {
                eq.dumpFilterCode(equalizer);
            });
            return {
                name: null,
                main: { nodes: this.m_nodeWeight, edges: this.m_edgeWeight },
                scaleLevelsOrder: scaleLevelsOrder,
                equalizer: equalizer
            };
        }

        private applyFilterSet(fj: FilterSettings)
        {
            this.m_nodeWeight = fj.main.nodes;
            this.m_edgeWeight = fj.main.edges;

            this.m_nodeFilterSlider.setValues(this.m_nodeWeight);
            this.m_edgeFilterSlider.setValues(this.m_edgeWeight);

            this.m_renderer.reorderScaleLevels(fj.scaleLevelsOrder);

            this.m_equalizer.forEach((eq: EqualizerItem) => {
                eq.harakiri();
            });
            this.m_equalizer = [];
            fj.equalizer.forEach((eq: EqualizerCode) => {
                let ei = new EqualizerItem(this.m_renderer,
                                           this.m_renderer.ringScales[eq.ringIndex].segmentByHash(eq.segmentHash),
                                           eq.ringIndex)
                ei.setWeights(eq.nodes, eq.edges);
                this.m_equalizer.push(ei);
            });

            this.m_renderer.updateNodesVisibility();
        }

        private saveFilterSet()
        {
            let f = [];
            $("#scivi_filter_sets").children().each((i: number, el: Element) => {
                let fi = $(el);
                let fj = fi.data("fcode");
                fj.name = fi.text();
                f.push(fj);
            });
            if (f.length > 0)
                this.m_renderer.downloadFile("filterSet.json", JSON.stringify(f));
        }

        public loadFilterSet(filterSet: FilterSettings[])
        {
            let fs = $("#scivi_filter_sets");
            fs.empty();
            filterSet.forEach((fj: FilterSettings, i: number) => {
                let fk = "scivi_filter_set_" + i;
                fs.append($("<option>", { value: i, text: fj.name, id: fk }));
                $("#" + fk).data("fcode", fj);
            });
            fs.val(-1);
            $("#scivi_filter_set_name").val("");
        }
    }
}
