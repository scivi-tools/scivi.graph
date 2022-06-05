namespace SciViCGraph
{
    export class Stats
    {
        private m_chart: Chart;
        private m_data: { datasets: any[], labels: string[] };
        private m_nodes: Node[];
        private m_tooltip: HTMLElement;
        private m_list: HTMLElement;
        private m_graphStat: HTMLElement;
        private m_nodesCount: number;
        private m_nodesWeight: number;
        private m_edgesCount: number;
        private m_edgesWeight: number;
        private m_hyperEdgesCount: number;
        private m_hyperEdgesWeight: number;
        private m_clInput: any;
        private m_clWrapper: HTMLElement;
        private m_selectedGroupIndex: number;

        constructor(private m_stats: HTMLElement, private m_svRenderer)
        {
            this.m_chart = null;

            Chart.defaults.global.tooltips.backgroundColor = "rgba(254, 254, 255, 0.9)";
            Chart.defaults.global.tooltips.titleFontColor = "#000";
            Chart.defaults.global.tooltips.bodyFontColor = "#000";
            Chart.defaults.global.tooltips.borderColor = "rgba(51, 51, 51, 1)",
            Chart.defaults.global.tooltips.cornerRadius = 5;
            Chart.defaults.global.tooltips.borderWidth = 1;
            Chart.defaults.global.tooltips.multiKeyBackground = "#000";
            Chart.defaults.global.hover.onHover = (event, points) => { this.chartHovered(points); };
            Chart.defaults.global.onClick = (event, points) => { this.chartClicked(points); };
            Chart.defaults.global.maintainAspectRatio = false;

            this.m_data = {
                datasets: [],
                labels: []
            };

            this.m_nodes = null;
            this.m_tooltip = null;
            this.m_list = null;
            this.m_graphStat = null;
            this.m_nodesCount = 0;
            this.m_nodesWeight = 0;
            this.m_edgesCount = 0;
            this.m_edgesWeight = 0;
            this.m_hyperEdgesCount = 0;
            this.m_hyperEdgesWeight = 0;
            this.m_clInput = null;
            this.m_clWrapper = null;
            this.m_selectedGroupIndex = -1;
        }

        private color2rgb(c: number): string
        {
            return "rgb(" + 
               (c >> 16 & 0xFF) + ", " +
               (c >> 8 & 0xFF) + ", " +
               (c & 0xFF) + ")";
        }

        private rgbString2color(rgb: string): string
        {
            let arr = rgb.split("(")[1].split(")")[0].split(",");
            let result = arr.map((x) => {
                x = parseInt(x).toString(16);
                return (x.length === 1) ? "0" + x : x;
            });
            return "#" + result.join("");
        }

        private color2RGBString(c: string): string
        {
            return this.color2rgb(string2color(c));
        }

        private countGroupContent(nodes: Node[]): number[]
        {
            this.m_nodes = nodes;
            let result = [];
            this.m_nodes.forEach((node) => {
                if (node.visible) {
                    let n = node.groupID - result.length;
                    for (let i = n; i >= 0; --i)
                        result.push(0);
                    result[node.groupID]++;
                }
            });
            return result;
        }

        private convertColors(colors: number[], n: number): string[]
        {
            let result = [];
            for (let i = 0; i < n; ++i)
                result.push(this.color2rgb(colors[i]));
            return result;
        }

        private generateGroupNames(n: number): string[]
        {
            let result = [];
            for (let i = 1; i <= n; ++i)
                result.push(this.m_svRenderer.localizer["LOC_GROUP"] + " " + i);
            return result;
        }

        private chartHovered(points)
        {
            this.m_svRenderer.highlightGroup(points.length > 0 ? points[0]._index : undefined);
        }

        private chartClicked(points)
        {
            if (points.length > 0) {
                this.m_selectedGroupIndex = points[0]._index;

                let clLabel = document.createElement("span");
                clLabel.innerHTML = this.m_svRenderer.localizer["LOC_GROUP"] + ": " + (this.m_selectedGroupIndex + 1) + ". " +
                                    this.m_svRenderer.localizer["LOC_COLOR"] + ":&nbsp;";

                const cl = this.rgbString2color(points[0]._view.backgroundColor);

                this.m_clWrapper = document.createElement("div");
                this.m_clWrapper.innerHTML = "&nbsp;";
                this.m_clWrapper.className = "scivi_color_wrapper";
                this.m_clWrapper.style.backgroundColor = cl;

                this.m_clInput = this.m_svRenderer.createColorPicker({
                    parent: this.m_clWrapper,
                    color: cl,
                    alpha: false,
                    onDone: (color) => {
                        const c = color.hex.substring(0, 7);
                        this.m_clWrapper.style.backgroundColor = c;
                        this.m_svRenderer.changeGroupColor(this.m_selectedGroupIndex, c);
                        points[0]._view.backgroundColor = this.color2RGBString(c);
                    }
                });

                let qZoomIn = null;
                if (this.m_svRenderer.canQuasiZoomIn()) {
                    qZoomIn = document.createElement("div");
                    qZoomIn.className = "scivi_button";
                    qZoomIn.innerHTML = this.m_svRenderer.localizer["LOC_ENTERGROUP"];
                    qZoomIn.onclick = () => {
                        this.m_svRenderer.quasiZoomIn(this.m_selectedGroupIndex);
                        this.chartClicked(points);
                    };
                }

                let qZoomOut = null;
                if (this.m_svRenderer.canQuasiZoomOut()) {
                    qZoomOut = document.createElement("div");
                    qZoomOut.className = "scivi_button";
                    qZoomOut.innerHTML = this.m_svRenderer.localizer["LOC_LEAVEGROUP"];
                    qZoomOut.onclick = () => {
                        this.m_svRenderer.quasiZoomOut();
                        this.clearSelection();
                    };
                }

                let listHolder = document.createElement("div");

                this.m_svRenderer.clearSelected();

                let list = "<ul>";
                this.m_nodes.forEach((node) => {
                    if (node.visible && node.groupID === points[0]._index) {
                        list += "<li>" + node.label + "</li>";
                        this.m_svRenderer.addToMultiselection(node);
                    }
                });
                list += "</ul>";
                listHolder.innerHTML = list;

                this.m_svRenderer.render(false, true);

                while (this.m_list.firstChild)
                    this.m_list.removeChild(this.m_list.firstChild);

                this.m_list.appendChild(clLabel);
                this.m_list.appendChild(this.m_clWrapper);
                if (qZoomIn)
                    this.m_list.appendChild(qZoomIn);
                if (qZoomOut)
                    this.m_list.appendChild(qZoomOut);
                this.m_list.appendChild(listHolder);
            } else {
                this.clearSelection();
                this.m_svRenderer.clearSelected();
                this.m_svRenderer.render(false, true);
            }
        }

        public clearSelection()
        {
            let hint = document.createElement("div");
            hint.innerHTML = this.m_svRenderer.localizer["LOC_STATSTUB"];

            while (this.m_list.firstChild)
                this.m_list.removeChild(this.m_list.firstChild);

            this.m_list.appendChild(hint);

            this.m_clInput = null;
            this.m_clWrapper = null;
            this.m_selectedGroupIndex = -1;
        }

        private chartCaption(n: number)
        {
            return this.m_svRenderer.localizer["LOC_STATCAPTION"] + n + ")";
        }

        public buildChart(nodes: Node[], colors: number[])
        {
            let data = this.countGroupContent(nodes);

            this.m_data.datasets = [{
                data: data,
                backgroundColor: this.convertColors(colors, data.length)
            }];
            this.m_data.labels = this.generateGroupNames(data.length)

            if (this.m_selectedGroupIndex >= 0) {
                const c = color2string(colors[this.m_selectedGroupIndex]);
                this.m_clWrapper.style.backgroundColor = c;
                this.m_clInput.setColor(c, true);
            }

            if (this.m_chart) {
                this.clearSelection();
                this.m_chart.config.options.title.text = this.chartCaption(data.length);
                this.m_chart.update();
            } else {
                let cvs = document.createElement("canvas");
                let divChart = document.createElement("div");
                this.m_graphStat = document.createElement("div");
                this.m_list = document.createElement("div");

                divChart.style.height = "300px";
                divChart.style.textAlign = "center";
                divChart.style.maxHeight = "300px";
                divChart.style.minHeight = "300px";
                divChart.appendChild(cvs);

                this.clearSelection();

                this.m_stats.appendChild(this.m_graphStat);
                this.m_stats.appendChild(divChart);
                this.m_stats.appendChild(this.m_list);
                
                let ctx = cvs.getContext("2d");

                let config = {
                    type: 'pie',
                    data: this.m_data,
                    options: {
                        responsive: true,
                        title: {
                            display: true,
                            text: this.chartCaption(data.length)
                        },
                        legend: {
                            display: false
                        },
                        cutoutPercentage: 50
                    }
                };

                this.m_chart = new Chart(ctx, config);
            }
        }

        private updateStats()
        {
            this.m_graphStat.innerHTML = this.m_svRenderer.localizer["LOC_GRAPHSTAT"] + " " +
                                         this.m_svRenderer.localizer["LOC_NODES"] + " " + this.m_nodesCount +
                                         " ( " + this.m_svRenderer.localizer["LOC_SUMWEIGHT"] + " " + this.m_nodesWeight + "); " +
                                         this.m_svRenderer.localizer["LOC_EDGES"] + " " + this.m_edgesCount +
                                         " ( " + this.m_svRenderer.localizer["LOC_SUMWEIGHT"] + " " + this.m_edgesWeight + ")";
            if (this.m_hyperEdgesCount > 0) {
                this.m_graphStat.innerHTML += "; " + this.m_svRenderer.localizer["LOC_HYPEREDGES"] + " " + this.m_hyperEdgesCount +
                                              " ( " + this.m_svRenderer.localizer["LOC_SUMWEIGHT"] + " " + this.m_hyperEdgesWeight + ")";
            }

        }

        public updateNodesStat(count: number, weight: number)
        {
            this.m_nodesCount = count;
            this.m_nodesWeight = weight;
            this.updateStats();
        }

        public updateEdgesStat(count: number, weight: number, hyperCount: number, hyperWeight: number)
        {
            this.m_edgesCount = count;
            this.m_edgesWeight = weight;
            this.m_hyperEdgesCount = hyperCount;
            this.m_hyperEdgesWeight = hyperWeight;
            this.updateStats();
        }
    }
}
