namespace SciViCGraph
{
    export class Prompt
    {
        private m_doneCB: (val: string) => void;
        private m_dialog: any;
        private m_text: HTMLElement;

        constructor(view: HTMLElement)
        {
            let promptElBase = document.createElement("div");
            promptElBase.id = "scivi_graph_prompt_base";
            view.appendChild(promptElBase);

            let promptEl = document.createElement("div");
            promptEl.id = "scivi_graph_prompt";
            view.appendChild(promptEl);

            let formEl = document.createElement("form");
            formEl.style.width = "98.5%";
            formEl.style.height = "99%";
            formEl.style.margin = "0px";
            formEl.style.padding = "0px";
            promptEl.appendChild(formEl);

            let fieldSetEl = document.createElement("fieldset");
            fieldSetEl.style.width = "100%";
            fieldSetEl.style.height = "100%";
            fieldSetEl.style.border = "0px";
            fieldSetEl.style.margin = "0px";
            fieldSetEl.style.padding = "0px";
            formEl.appendChild(fieldSetEl);
            
            let inputEl = document.createElement("textarea");
            inputEl.id = "scivi_graph_propmt_text_value";
            inputEl.classList.add("ui-widget-content");
            inputEl.classList.add("ui-corner-all");
            inputEl.style.width = "100%";
            inputEl.style.height = "100%";
            fieldSetEl.appendChild(inputEl);
            this.m_text = inputEl;

            let submitEl = document.createElement("input");
            submitEl.type = "submit";
            submitEl.tabIndex = -1;
            submitEl.style.position = "absolute";
            submitEl.style.top = "-1000px";
            submitEl.style.display = "block";
            fieldSetEl.appendChild(submitEl);

            let form = null;

            this.m_dialog = $("#scivi_graph_prompt").dialog({
                appendTo: "#scivi_graph_prompt_base",
                autoOpen: false,
                height: 180,
                width: 350,
                modal: true,
                buttons: {
                    "OK": () => { this.done(); },
                    Cancel: () => { this.m_dialog.dialog("close"); }
                },
                close: () => { form[0].reset(); }
            });

            form = this.m_dialog.find("form").on("submit", (e) => {
                e.preventDefault();
                this.done();
            });
        }

        private done(): boolean
        {
            let value = $("#scivi_graph_propmt_text_value").val();
            this.m_doneCB(value);
            this.m_dialog.dialog("close");
            return true;
        }

        public show(title: string, content: string, doneCB: (val: string) => void)
        {
            this.m_dialog.dialog("option", "title", title);
            this.m_text.innerHTML = content;
            this.m_doneCB = doneCB;
            this.m_dialog.dialog("open");
        }

        get isOpen(): boolean
        {
            return this.m_dialog.dialog("isOpen");
        }
    }
}
