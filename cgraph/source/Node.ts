namespace SciViGraph
{
    export class Node extends PIXI.Sprite
    {
        private m_highlight: HighlightType;
        private m_needsUpdate: boolean;
        private m_highlightSet: boolean;
        private m_edges: Edge[];
        private m_info: HTMLElement;
        private m_text: PIXI.Text;
        private m_column: PIXI.Graphics;
        private m_svRenderer: Renderer;
        private m_edgeBatches: EdgeBatch[];
        private m_isShown;
        private m_listLabel;

        public static passiveTextAlpha = 0.3;
        private static readonly m_hoveredTextAlpha = 1.0;
        private static readonly m_selectedTextAlpha = 1.0;

        private static readonly m_columnMinHeight = 2.0;
        private static readonly m_textPadding = 15.0;

        constructor(public id: number, public label: string, public groupID: number, public weight: number, public nmb: number, public date: Date)
        {
            super();

            this.m_column = new PIXI.Graphics();
            this.m_column.beginFill(0xFFCB35, 1.0);
            this.addChild(this.m_column);

            this.m_text = new PIXI.Text(label);
            this.m_text.style = new PIXI.TextStyle({
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                fontSize: "24px",
                wordWrapWidth: 200
            });
            this.addChild(this.m_text);

            this.m_highlight = undefined;
            this.m_needsUpdate = false;
            this.m_highlightSet = false;
            this.m_isShown = true;
            this.m_listLabel = null;
        }

        public postInfo()
        {
            let header = document.createElement("div");
            header.innerHTML = "<b style=\"color:red\">" + this.label + "</b>";

            if (this.date != null)
                header.innerHTML += "&nbsp;&nbsp;&nbsp;(" + this.date.toLocaleDateString() + ")";

            let clLabel = document.createElement("span");
            clLabel.innerHTML = "Группа: " + (this.groupID + 1) + ". Цвет:&nbsp;";

            let clInput = document.createElement("input");
            clInput.type = "color";
            clInput.value = color2string(this.groupColor);
            clInput.onchange = () => { this.m_svRenderer.changeActiveGroupColor(clInput.value); };

            let qZoomIn = document.createElement("button");
            qZoomIn.innerHTML = "Перейти к группе";
            qZoomIn.onclick = () => {
                this.m_svRenderer.quasiZoomIn(this.groupID);
                this.m_svRenderer.clearChartSelection();
            };
            if (!this.m_svRenderer.canQuasiZoomIn())
                qZoomIn.disabled = true;

            let qZoomOut = document.createElement("button");
            qZoomOut.innerHTML = "Выйти из группы";
            qZoomOut.onclick = () => {
                this.m_svRenderer.quasiZoomOut();
                this.m_svRenderer.clearChartSelection();
            };
            if (!this.m_svRenderer.canQuasiZoomOut())
                qZoomOut.disabled = true;

            let nList = document.createElement("div");
            let connList = "<div>Связанные вершины:</div><ul>";
            this.m_edges.forEach((edge) => {
                if (edge.visible) {
                    if (edge.target != this)
                        connList += "<li>" + edge.target.label + "</li>";
                    else
                        connList += "<li>" + edge.source.label + "</li>";
                }
            });
            connList += "</ul>";
            nList.innerHTML = connList;

            while (this.m_info.firstChild)
                this.m_info.removeChild(this.m_info.firstChild);

            this.m_info.appendChild(header);
            this.m_info.appendChild(clLabel);
            this.m_info.appendChild(clInput);
            this.m_info.appendChild(qZoomIn);
            this.m_info.appendChild(qZoomOut);
            this.m_info.appendChild(nList);
        }

        public postListItem(list: HTMLElement)
        {
            let cbInput = document.createElement("input");
            cbInput.type = "checkbox";
            cbInput.checked = this.m_isShown;
            cbInput.onchange = () => {
                this.m_isShown = cbInput.checked;
                this.m_svRenderer.updateNodesVisibility();
                if (!this.m_isShown) {
                    this.m_listLabel.style.fontWeight = "";
                    this.m_listLabel.innerHTML = this.label;
                }
            };

            this.m_listLabel = document.createElement("span");
            this.m_listLabel.innerHTML = this.label;
            this.m_listLabel.onmouseover = () => { this.m_svRenderer.hoverNode(this); };
            this.m_listLabel.onmouseout = () => { this.m_svRenderer.hoverNode(null); };
            this.m_listLabel.onclick = () => {
                if (this.m_isShown)
                    this.m_svRenderer.selectNode(this);
            };

            let itm = document.createElement("div");
            itm.appendChild(cbInput);
            itm.appendChild(this.m_listLabel);

            list.appendChild(itm);
        }

        set highlight(hl: HighlightType)
        {
            if (hl != this.m_highlight) {
                this.m_highlight = hl;
                this.color = this.groupColor;
                switch (this.m_highlight) {
                    case HighlightType.None: {
                        this.m_text.style.fontWeight = "";
                        this.m_text.text = this.label;
                        if (this.m_listLabel) {
                            this.m_listLabel.style.fontWeight = "";
                            this.m_listLabel.innerHTML = this.label;
                        }
                        this.alpha = Node.passiveTextAlpha;
                        break;
                    }

                    case HighlightType.Hover: {
                        this.m_text.style.fontWeight = "";
                        this.m_text.text = this.label;
                        if (this.m_listLabel) {
                            this.m_listLabel.style.fontWeight = "";
                            this.m_listLabel.innerHTML = this.label;
                        }
                        this.alpha = Node.m_hoveredTextAlpha;
                        break;
                    }

                    case HighlightType.Selection: {
                        this.m_text.style.fontWeight = "bold";
                        this.m_text.text = "[ " + this.label + " ]";
                        if (this.m_listLabel) {
                            this.m_listLabel.style.fontWeight = "bold";
                            this.m_listLabel.innerHTML = "[ " + this.label + " ]";
                        }
                        this.alpha = Node.m_selectedTextAlpha;
                        break;
                    }
                }
                this.m_needsUpdate = true;
            }
            this.m_highlightSet = true;
        }

        get highlight(): HighlightType
        {
            return this.m_highlight;
        }

        get highlightSet(): boolean
        {
            return this.m_highlightSet;
        }

        get groupColor(): number
        {
            return (this.parent as Scene).colors[this.groupID];
        }

        get isShown(): boolean
        {
            return this.m_isShown;
        }

        set color(newColor: number) 
        {
            this.m_text.style.fill = color2string(newColor);
        }

        set info(newInfo: HTMLElement)
        {
            this.m_info = newInfo;
        }

        public addEdge(edge: Edge)
        {
            this.m_edges.push(edge);

            let batch
            if (this.m_edgeBatches.length == 0 || 
                this.m_edgeBatches[this.m_edgeBatches.length - 1].isFull) {
                batch = new EdgeBatch();
                this.m_edgeBatches.push(batch);
            } else {
                batch = this.m_edgeBatches[this.m_edgeBatches.length - 1];
            }
            batch.addEdge(edge);
        }

        public clearEdges()
        {
            this.m_edges = [];
            this.m_edgeBatches = [];
        }

        get edges(): Edge[]
        {
            return this.m_edges;
        }

        get edgeBatches(): EdgeBatch[]
        {
            return this.m_edgeBatches;
        }

        set svRenderer(newSVRenderer: Renderer)
        {
            this.m_svRenderer = newSVRenderer;
        }

        public prepare(): boolean
        {
            if (!this.m_highlightSet)
                this.highlight = HighlightType.None;
            let result = this.m_needsUpdate;
            this.m_highlightSet = false;
            this.m_needsUpdate = false;
            return result;
        }

        public invalidate()
        {
            this.m_highlight = undefined;
            this.m_highlightSet = false;
            this.m_edges.forEach((edge) => {
                if (edge.visible)
                    edge.invalidate();
            });
        }

        public setAnchor(x: number, y: number, maxHeight: number)
        {
            let p = this.parent as Scene;
            let w = Node.m_columnMinHeight + (maxHeight - Node.m_columnMinHeight) * this.weight / p.maxNodeWeight;
            this.m_column.clear();
            this.m_column.drawRect(-w * x, -this.m_text.height * y, w, this.m_text.height);
            this.m_text.anchor.set(x, y);
            this.m_text.position.set(Node.m_textPadding * (this.scale.x > 0.0 ? 1.0 : -1.0), 0);
        }

        public setHighlightForEdgesAndTargetNodes(hl: HighlightType)
        {
            this.m_edges.forEach((edge) => {
                if (edge.visible) {
                    edge.highlight = hl;
                    if (!edge.target.highlightSet)
                        edge.target.highlight = hl;
                }
            });
        }

        public setHighlightForEdges(hl: HighlightType)
        {
            this.m_edges.forEach((edge) => {
                if (edge.visible)
                    edge.highlight = hl;
            });
        }

        public labelSize(): { width: number, height: number }
        {
            let w = 0.0;
            if (this.m_text.style.fontWeight == "")
                w = this.m_text.width;
            else {
                this.m_text.style.fontWeight = "";
                this.m_text.text = this.label;
                w = this.m_text.width;
                this.m_text.style.fontWeight = "bold";
                this.m_text.text = "[ " + this.label + " ]";
            }
            return { width: w / 2.0 + Node.m_textPadding, height: this.m_text.height / 2.0 - 4.5 };
        }

        set wordWrap(ww: boolean)
        {
            this.m_text.style.wordWrap = ww;
        }
    }
}
