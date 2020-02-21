namespace SciViCGraph
{
    export class StateLineNavigator
    {
        constructor(private m_renderer: Renderer, private m_container: HTMLElement)
        {
        }

        private extractIndexFromKey(key: string, stateLineIndex: number): number
        {
            return parseInt(key.split("|")[stateLineIndex]);
        }

        private changeCurrentState(stateLineIndex: number, stateIndex: number)
        {
            let indices = this.m_renderer.currentStateKey.split("|");
            indices[stateLineIndex] = stateIndex.toString();
            this.m_renderer.changeCurrentState(indices.join("|"), false);
        }

        private createStateLine(labels: string[], stateLineIndex: number): any
        {
            const strIndex = stateLineIndex.toString();
            let result = $("<div/>");
            result.css("width", "100%");
            result.css("height", "50px");
            let line = $("<div/>");
            line.attr("id", "scivi_stateline_slider_" + strIndex);
            line.attr("class", "scivi_stateline");
            line.css("width", "100%");
            line.slider({
                value: this.extractIndexFromKey(this.m_renderer.currentStateKey, stateLineIndex),
                min: 0,
                max: labels.length - 1,
                step: 1,
                slide: (event, ui) => { this.changeCurrentState(stateLineIndex, ui.value); }
            }).each(() => {
                const n = labels.length - 1;
                for (let i = 0; i <= n; ++i) {
                    const el = $("<label class='scivi_stateline_label scivi_stateline_label_" +
                                 strIndex +
                                 "'><span style='color: #c5c5c5;'>|</span><br/>" +
                                 labels[i] +
                                 "</label>");
                    el.css("left", (i / n * 100) + "%");
                    line.append(el);
                }
            });
            result.append(line);
            return result;
        }

        public build()
        {
            if (this.m_container) {
                this.m_renderer.states.stateLines.forEach((sl, index) => {
                    $(this.m_container).append(this.createStateLine(sl, index));
                });
                this.updateStateLineLabels();
            }
        }

        public updateStateLineLabels()
        {
            if (this.m_container) {
                const lp = parseFloat($("#scivi_cgraph_stateline").css('padding-left'));
                const rp = parseFloat($("#scivi_cgraph_stateline").css('padding-right'));
                const m = Math.min(lp, rp) * 2;
                this.m_renderer.states.stateLines.forEach((sl, index) => {
                    const sel = ".scivi_stateline_label_" + index.toString();
                    let w = (this.m_container.clientWidth - lp - rp) / sl.length;
                    if (w < 30)
                        w = 30;
                    else if (w > m)
                        w = m;
                    $(sel).css("width", w + "px");
                    $(sel).css("margin-left", (-w * 0.5) + "px");
                });
            }
        }
    }
}
