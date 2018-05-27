namespace SciViCGraph
{
    interface ChartInstance
    {
        update: () => void;
    }

    declare var Chart: {
        new (context: CanvasRenderingContext2D, config: {}): ChartInstance;
        defaults: any;
    };

    export class Stats
    {
        private m_chart: ChartInstance;
        private m_data: { datasets: any[], labels: string[] };
        private m_nodes: Node[];
        private m_tooltip: HTMLElement;
        private m_list: HTMLElement;
        private m_clInput: HTMLInputElement;
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
            this.m_clInput = null;
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
                return (x.length == 1) ? "0" + x : x;
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
                let n = node.groupID - result.length;
                for (let i = n; i >= 0; --i)
                    result.push(0);
                result[node.groupID]++;
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

                this.m_clInput = document.createElement("input");
                this.m_clInput.type = "color";
                this.m_clInput.value = this.rgbString2color(points[0]._view.backgroundColor);
                this.m_clInput.onchange = () => {
                    this.m_svRenderer.changeGroupColor(this.m_selectedGroupIndex, this.m_clInput.value);
                    points[0]._view.backgroundColor = this.color2RGBString(this.m_clInput.value);
                };

                let qZoomIn = document.createElement("button");
                qZoomIn.innerHTML = this.m_svRenderer.localizer["LOC_ENTERGROUP"];
                qZoomIn.onclick = () => {
                    this.m_svRenderer.quasiZoomIn(this.m_selectedGroupIndex);
                    this.chartClicked(points);
                };
                if (!this.m_svRenderer.canQuasiZoomIn())
                    qZoomIn.disabled = true;

                let qZoomOut = document.createElement("button");
                qZoomOut.innerHTML = this.m_svRenderer.localizer["LOC_LEAVEGROUP"];
                qZoomOut.onclick = () => {
                    this.m_svRenderer.quasiZoomOut();
                    this.clearSelection();
                };
                if (!this.m_svRenderer.canQuasiZoomOut())
                    qZoomOut.disabled = true;

                let listHolder = document.createElement("div");

                let list = "<ul>";
                this.m_nodes.forEach((node) => {
                    if (node.groupID == points[0]._index)
                        list += "<li>" + node.label + "</li>";
                });
                list += "</ul>";
                listHolder.innerHTML = list;

                while (this.m_list.firstChild)
                    this.m_list.removeChild(this.m_list.firstChild);

                this.m_list.appendChild(clLabel);
                this.m_list.appendChild(this.m_clInput);
                this.m_list.appendChild(qZoomIn);
                this.m_list.appendChild(qZoomOut);
                this.m_list.appendChild(listHolder);
            } else {
                this.clearSelection();
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
            this.m_selectedGroupIndex = -1;
        }

        public buildChart(nodes: Node[], colors: number[])
        {
            let data = this.countGroupContent(nodes);

            this.m_data.datasets = [{
                data: data,
                backgroundColor: this.convertColors(colors, data.length)
            }];
            this.m_data.labels = this.generateGroupNames(data.length)

            if (this.m_selectedGroupIndex >= 0)
                this.m_clInput.value = color2string(colors[this.m_selectedGroupIndex]);

            if (this.m_chart)
                this.m_chart.update();
            else {
                let cvs = document.createElement("canvas");
                let divChart = document.createElement("div");
                this.m_list = document.createElement("div");

                divChart.style.height = "300px";
                divChart.style.textAlign = "center";
                divChart.style.maxHeight = "300px";
                divChart.style.minHeight = "300px";
                divChart.appendChild(cvs);

                this.clearSelection();

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
                            text: this.m_svRenderer.localizer["LOC_STATCAPTION"] + data.length + ")"
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
    }
}