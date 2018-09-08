namespace SciViCGraph
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
        private m_isShown: boolean;
        private m_listLabel: HTMLSpanElement;
        private m_cbInput: HTMLInputElement;
        private m_hoveredEdge: Edge;

        public static passiveTextAlpha = 0.5;
        private static readonly m_hoveredTextAlpha = 1.0;
        private static readonly m_selectedTextAlpha = 1.0;

        private static readonly m_columnMinHeight = 2.0;
        private static readonly m_textPadding = 15.0;

        constructor(private m_dict: {})
        {
            super();

            this.m_column = new PIXI.Graphics();
            this.m_column.beginFill(0xFFCB35, 1.0);
            this.addChild(this.m_column);

            this.m_text = new PIXI.Text(this.label);
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
            this.m_cbInput = null;
            this.m_hoveredEdge = null;
        }

        get id(): number
        {
            return this.m_dict["id"];
        }

        get label(): string
        {
            return this.m_dict["label"];
        }

        set label(lbl: string)
        {
            this.m_dict["label"] = lbl;
        }

        get groupID(): number
        {
            return this.m_dict["group"] !== undefined ? this.m_dict["group"] : 0;
        }

        set groupID(gID: number)
        {
            this.m_dict["group"] = gID;
        }

        get weight(): number
        {
            return this.m_dict["weight"] !== undefined ? this.m_dict["weight"] : 0;
        }

        get date(): Date
        {
            if (this.m_dict["date"] === undefined)
                return null;
            else if (typeof this.m_dict["date"].getMonth !== "function")
                this.m_dict["date"] = new Date(this.m_dict["date"]);
            return this.m_dict["date"];
        }

        get custom(): {}
        {
            return this.m_dict;
        }

        public postInfo()
        {
            let header = document.createElement("div");
            let name = document.createElement("input");
            name.type = "text";
            name.value = this.label;
            name.style.fontWeight = "bold";
            name.style.width = "300px";
            name.style.marginRight = "5px";
            let changeName = document.createElement("button");
            changeName.innerHTML = this.m_svRenderer.localizer["LOC_CHANGE"];
            changeName.onclick = () => {
                this.label = name.value;
                this.m_svRenderer.updateNodeNames();
            };
            header.appendChild(name);
            header.appendChild(changeName);

            let customPropList = "";
            for (let prop in this.m_dict) {
                if (prop !== "id" && prop !== "label" && prop !== "group" && prop !== "date")
                    customPropList += "<li>" + prop + ": " + this.m_dict[prop] + "</li>";
                else if (prop === "date")
                    customPropList += "<li>" + prop + ": " + this.date.toLocaleDateString() + "</li>";
            }
            if (customPropList.length > 0) {
                let customProps = document.createElement("div");
                customProps.innerHTML = this.m_svRenderer.localizer["LOC_NODE_DATA"] + ":<ul>" + customPropList + "</ul>";
                header.appendChild(customProps);
            }

            let colorLabel = document.createElement("span");
            colorLabel.innerHTML = this.m_svRenderer.localizer["LOC_GROUP"] + ": " + (this.groupID + 1) + 
                                   ". " + this.m_svRenderer.localizer["LOC_COLOR"] + ":&nbsp;";

            let colorInput = document.createElement("input");
            colorInput.type = "color";
            colorInput.value = color2string(this.groupColor);
            colorInput.onchange = () => { this.m_svRenderer.changeActiveGroupColor(colorInput.value); };

            let qZoomIn = document.createElement("button");
            qZoomIn.innerHTML = this.m_svRenderer.localizer["LOC_ENTERGROUP"];
            qZoomIn.onclick = () => {
                this.m_svRenderer.quasiZoomIn(this.groupID);
                this.m_svRenderer.clearChartSelection();
            };
            if (!this.m_svRenderer.canQuasiZoomIn())
                qZoomIn.disabled = true;

            let qZoomOut = document.createElement("button");
            qZoomOut.innerHTML = this.m_svRenderer.localizer["LOC_LEAVEGROUP"];
            qZoomOut.onclick = () => {
                this.m_svRenderer.quasiZoomOut();
                this.m_svRenderer.clearChartSelection();
            };
            if (!this.m_svRenderer.canQuasiZoomOut())
                qZoomOut.disabled = true;

            let nodesList = document.createElement("div");
            let connList = "<div>" + this.m_svRenderer.localizer["LOC_LINKEDNODES"] + "</div><ul>";
            this.m_edges.forEach((edge) => {
                if (edge.visible) {
                    if (edge.target !== this)
                        connList += "<li>" + edge.target.label + "</li>";
                    else
                        connList += "<li>" + edge.source.label + "</li>";
                }
            });
            connList += "</ul>";
            nodesList.innerHTML = connList;

            while (this.m_info.firstChild)
                this.m_info.removeChild(this.m_info.firstChild);

            this.m_info.appendChild(header);
            this.m_info.appendChild(colorLabel);
            this.m_info.appendChild(colorInput);
            this.m_info.appendChild(qZoomIn);
            this.m_info.appendChild(qZoomOut);
            this.m_info.appendChild(nodesList);
        }

        public postListItem(list: HTMLElement)
        {
            this.m_cbInput = document.createElement("input");
            this.m_cbInput.type = "checkbox";
            this.m_cbInput.checked = this.m_isShown;
            this.m_cbInput.onchange = () => {
                this.isShown = this.m_cbInput.checked;
                this.m_svRenderer.updateNodesVisibility();
            };

            this.m_listLabel = document.createElement("span");
            this.m_listLabel.innerHTML = this.label;
            this.m_listLabel.onmouseover = () => {
                if (this.m_isShown)
                    this.m_svRenderer.hoverNode(this);
            };
            this.m_listLabel.onmouseout = () => {
                if (this.m_isShown)
                    this.m_svRenderer.hoverNode(null);
            };
            this.m_listLabel.onclick = () => {
                if (this.m_isShown)
                    this.m_svRenderer.selectNode(this);
            };

            let itm = document.createElement("div");
            itm.appendChild(this.m_cbInput);
            itm.appendChild(this.m_listLabel);

            list.appendChild(itm);
        }

        set highlight(hl: HighlightType)
        {
            if (hl !== this.m_highlight) {
                this.m_highlight = hl;
                this.color = this.groupColor;
                switch (this.m_highlight) {
                    case HighlightType.None: {
                        this.m_text.style.fontWeight = "normal";
                        this.m_text.text = this.label;
                        if (this.m_listLabel) {
                            this.m_listLabel.style.fontWeight = "normal";
                            this.m_listLabel.innerHTML = this.label;
                        }
                        this.alpha = Node.passiveTextAlpha;
                        break;
                    }

                    case HighlightType.Hover: {
                        this.m_text.style.fontWeight = "normal";
                        this.m_text.text = this.label;
                        if (this.m_listLabel) {
                            this.m_listLabel.style.fontWeight = "normal";
                            this.m_listLabel.innerHTML = this.label;
                        }
                        this.alpha = Node.m_hoveredTextAlpha;
                        break;
                    }

                    case HighlightType.Selection: {
                        this.m_text.style.fontWeight = "bold";
                        this.m_text.text = "[-" + this.label + "-]";
                        if (this.m_listLabel) {
                            this.m_listLabel.style.fontWeight = "bold";
                            this.m_listLabel.innerHTML = "[-" + this.label + "-]";
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

        set isShown(shown: boolean)
        {
            this.m_isShown = shown;
            if (this.m_cbInput)
                this.m_cbInput.checked = shown; // Does not invoke onChange.
            if (!this.m_isShown) {
                this.m_listLabel.style.fontWeight = "normal";
                this.m_listLabel.innerHTML = this.label;
            }
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

            let batch = null;
            if (this.m_edgeBatches.length === 0 || 
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

        public invalidate(wipeInternals: boolean)
        {
            this.m_highlight = undefined;
            this.m_highlightSet = false;
            this.m_edges.forEach((edge) => {
                if (edge.visible)
                    edge.invalidate(wipeInternals);
            });
        }

        public setAnchor(x: number, y: number, maxHeight: number)
        {
            let p = this.parent as Scene;
            let w = Node.m_columnMinHeight +
                    (maxHeight - Node.m_columnMinHeight) / (p.nodeWeight.max - p.nodeWeight.min) *
                    (this.weight - p.nodeWeight.min);
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

        public labelSize(normalize: boolean): { width: number, height: number }
        {
            let w = 0.0;
            if (this.m_text.style.fontWeight === "normal" || !normalize)
                w = this.m_text.width;
            else {
                this.m_text.style.fontWeight = "normal";
                this.m_text.text = this.label;
                w = this.m_text.width;
                this.m_text.style.fontWeight = "bold";
                this.m_text.text = "[-" + this.label + "-]";
            }
            return { width: w / 2.0 + Node.m_textPadding, height: this.m_text.height / 2.0 - 5.0 };
        }

        set wordWrap(ww: boolean)
        {
            this.m_text.style.wordWrap = this.m_text.text.indexOf(" ") !== -1 && ww;
        }

        get fontSize(): number
        {
            return parseInt(this.m_text.style.fontSize as string);
        }

        set fontSize(fs: number)
        {
            this.m_text.style.fontSize = fs + "px";
        }

        set align(a: string)
        {
            this.m_text.style.align = a;
        }

        private getEdgeByPosition(x: number, y: number, s: number): Edge
        {
            if (isNaN(x) || isNaN(y))
                return null;
            const d = x * x + y * y;
            const r = this.m_svRenderer.radius;
            const inRing = r * r * s * s;
            if (d < inRing) {
                for (let i = this.m_edges.length - 1; i >= 0; --i) {
                    if (this.m_edges[i].visible && this.m_edges[i].hitTest(x / s, y / s))
                        return this.m_edges[i];
                }
            }
            return null;
        }

        public handleCursorMove(x: number, y: number, s: number, gx: number, gy: number): boolean
        {
            let hoveredEdge = this.getEdgeByPosition(x, y, s);
            const offset = 20;
            if (hoveredEdge) {
                if (this.m_hoveredEdge !== hoveredEdge) {
                    if (this.m_hoveredEdge)
                        this.m_hoveredEdge.isGlowing = false;
                    this.m_hoveredEdge = hoveredEdge;
                    this.m_hoveredEdge.isGlowing = true;
                    if (this.m_hoveredEdge.tooltip)
                        $(".scivi_graph_tooltip").html(this.m_hoveredEdge.tooltip);
                    else
                        $(".scivi_graph_tooltip").html(this.m_hoveredEdge.weight.toString());
                    $(".scivi_graph_tooltip").css({top: gy, left: gx + offset});
                    $(".scivi_graph_tooltip").stop(true);
                    $(".scivi_graph_tooltip").fadeIn(100);
                    $(".scivi_graph_tooltip")[0]["host"] = this;
                    return true;
                }
                $(".scivi_graph_tooltip").css({top: gy, left: gx + offset, position: "absolute"});
                return false;
            } else {
                if (this.m_hoveredEdge) {
                    this.m_hoveredEdge.isGlowing = false;
                    this.m_hoveredEdge = null;
                    if ($(".scivi_graph_tooltip")[0]["host"] === this) {
                        $(".scivi_graph_tooltip").stop(true);
                        $(".scivi_graph_tooltip").fadeOut(100);
                    }
                    return true;
                }
            }
            return false;
        }
    }
}
