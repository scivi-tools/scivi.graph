namespace SciViCGraph
{
    export class StateLineNavigator
    {
        private m_curtain: JQuery;
        private m_currentKeyIndices: number[];

        constructor(private m_renderer: Renderer, private m_container: HTMLElement)
        {
            this.m_curtain = null;
            this.m_currentKeyIndices = null;
        }

        private extractIndexFromKey(key: string, stateLineIndex: number): number
        {
            return parseInt(key.split("|")[stateLineIndex]);
        }

        private changeCurrentState(stateLineIndex: number, stateIndex: number)
        {
            this.m_currentKeyIndices[stateLineIndex] = stateIndex;
            this.m_renderer.changeCurrentState(this.m_currentKeyIndices.join("|"));
        }

        private createStateLine(labels: string[], stateLineIndex: number): JQuery
        {
            const strIndex = stateLineIndex.toString();
            const keyIndex = this.extractIndexFromKey(this.m_renderer.currentStateKey, stateLineIndex);
            this.m_currentKeyIndices[stateLineIndex] = keyIndex;
            let result = $("<div/>");
            result.css("width", "100%");
            result.css("height", "50px");
            let line = $("<div/>");
            line.attr("id", "scivi_stateline_slider_" + strIndex);
            line.attr("class", "scivi_stateline");
            line.css("width", "100%");
            line.slider({
                value: keyIndex,
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
                this.m_currentKeyIndices = [];
                this.m_renderer.states.stateLines.forEach(() => {
                    this.m_currentKeyIndices.push(0);
                });
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

        public curtain()
        {
            if (!this.m_curtain) {
                this.m_curtain = $("<div class='scivi_state_line_curtain'>");
                const bg = $("<div class='scivi_state_line_curtain_bg'>");
                const lbl = $("<div class='scivi_state_line_curtain_lbl'>");
                lbl.html(this.m_renderer.localizer["LOC_STATECALCULATED"]);
                lbl.click(() => {
                    this.m_curtain.detach();
                    this.m_renderer.changeCurrentState(this.m_currentKeyIndices.join("|"));
                });
                bg.append(lbl);
                this.m_curtain.append(bg);
            }
            $(this.m_container).append(this.m_curtain);
        }
    }
}
