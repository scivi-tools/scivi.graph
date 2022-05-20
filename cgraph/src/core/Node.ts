namespace SciViCGraph
{
    export class Node extends PIXI.Sprite
    {
        private m_highlight: HighlightType;
        private m_needsUpdate: boolean;
        private m_highlightSet: boolean;
        private m_edges: Edge[];
        private m_hyperEdges: HyperEdge[];
        private m_info: HTMLElement;
        private m_text: PIXI.Text;
        private m_column: PIXI.Graphics;
        private m_marker: PIXI.Graphics;
        private m_svRenderer: Renderer;
        private m_edgeBatches: EdgeBatch[];
        private m_isShown: boolean;
        private m_listLabel: HTMLSpanElement;
        private m_cbInput: HTMLInputElement;
        private m_selInput: HTMLInputElement;
        private m_hoveredEdge: Edge;
        private m_selectedEdge: Edge;
        private m_hoveredHyperEdge: HyperEdge;
        private m_selectedHyperEdge: HyperEdge;
        private m_markerRect: { x: number, y: number, w: number, h: number };
        private m_multiselected: boolean;
        private m_customColor;

        public static passiveTextAlpha = 1.0;
        private static readonly m_hoveredTextAlpha = 1.0;
        private static readonly m_selectedTextAlpha = 1.0;

        private static readonly m_columnMinHeight = 2.0;
        private static readonly m_textPadding = 15.0;

        constructor(private m_dict: {})
        {
            super();

            const histColor = this.m_dict["histColor"] === undefined ? 0xFFCB35 : string2color(this.m_dict["histColor"]);

            this.m_column = new PIXI.Graphics();
            this.m_column.beginFill(histColor, 1.0);
            this.addChild(this.m_column);

            this.m_text = new PIXI.Text(this.label);
            this.m_text.style = new PIXI.TextStyle({
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                fontSize: "24px",
                wordWrapWidth: 200
            });
            this.addChild(this.m_text);

            this.m_marker = new PIXI.Graphics();
            this.m_marker.visible = false;
            this.addChild(this.m_marker);

            this.m_markerRect = { x: 0, y: 0, w: 0, h: 0 };

            this.m_highlight = undefined;
            this.m_needsUpdate = false;
            this.m_highlightSet = false;
            this.m_isShown = true;
            this.m_listLabel = null;
            this.m_cbInput = null;
            this.m_selInput = null;
            this.m_hoveredEdge = null;
            this.m_selectedEdge = null;
            this.m_multiselected = false;
            this.m_hoveredHyperEdge = null;
            this.m_selectedHyperEdge = null;
            this.m_customColor = null;
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

        public clone(newID?: number): Node
        {
            const dict = JSON.parse(JSON.stringify(this.m_dict));
            if (newID !== undefined)
                dict["id"] = newID;
            return new Node(dict);
        }

        public postInfo()
        {
            if (!this.m_info)
                return;

            let header = document.createElement("div");
            let name = document.createElement("input");
            name.type = "text";
            name.value = this.label;
            name.style.fontWeight = "bold";
            name.style.width = "300px";
            name.style.marginRight = "5px";
            let changeName = document.createElement("div");
            changeName.className = "scivi_button";
            changeName.innerHTML = this.m_svRenderer.localizer["LOC_CHANGE"];
            changeName.onclick = () => {
                this.label = name.value;
                this.m_svRenderer.updateNodeNames();
            };
            header.appendChild(name);
            header.appendChild(changeName);

            let customPropList = "";
            for (let prop in this.m_dict) {
                if (prop !== "id" && prop !== "label" && prop !== "group" && prop !== "date" && prop !== "metadata")
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

            const cl = color2string(this.groupColor);

            let colorWrapper = document.createElement("div");
            colorWrapper.innerHTML = "&nbsp;";
            colorWrapper.className = "scivi_color_wrapper";
            colorWrapper.style.backgroundColor = cl;

            const colorInput = this.m_svRenderer.createColorPicker({
                parent: colorWrapper,
                color: cl,
                alpha: false,
                onDone: (color) => {
                    const c = color.hex.substring(0, 7);
                    colorWrapper.style.backgroundColor = c;
                    this.m_svRenderer.changeActiveGroupColor(c);
                }
            });

            let qZoomIn = null;
            if (this.m_svRenderer.canQuasiZoomIn()) {
                qZoomIn = document.createElement("div");
                qZoomIn.className = "scivi_button";
                qZoomIn.innerHTML = this.m_svRenderer.localizer["LOC_ENTERGROUP"];
                qZoomIn.onclick = () => {
                    this.m_svRenderer.quasiZoomIn(this.groupID);
                    this.m_svRenderer.clearChartSelection();
                };
            }

            let qZoomOut = null;
            if (this.m_svRenderer.canQuasiZoomOut()) {
                qZoomOut = document.createElement("div");
                qZoomOut.className = "scivi_button";
                qZoomOut.innerHTML = this.m_svRenderer.localizer["LOC_LEAVEGROUP"];
                qZoomOut.onclick = () => {
                    this.m_svRenderer.quasiZoomOut();
                    this.m_svRenderer.clearChartSelection();
                };
            }

            let nodesList = null;
            if (this.m_edges.length > 0) {
                nodesList = document.createElement("div");
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
            }

            let hyperNodesList = null;
            if (this.m_hyperEdges.length > 0) {
                hyperNodesList = document.createElement("div");
                let hyperConnList = "<div>" + this.m_svRenderer.localizer["LOC_HYPERLINKEDNODES"] + "</div><ul>";
                this.m_hyperEdges.forEach((hyperEdge) => {
                    if (hyperEdge.visible) {
                        hyperEdge.nodes.forEach((lNode) => {
                            if (lNode.visible && lNode !== this)
                                hyperConnList += "<li>" + lNode.label + "</li>";
                        });
                    }
                });
                hyperConnList += "</ul>";
                hyperNodesList.innerHTML = hyperConnList;
            }

            let md = null;
            if (this.m_dict["metadata"] !== undefined) {
                md = document.createElement("div");
                md.innerHTML = this.m_dict["metadata"];
            }

            while (this.m_info.firstChild)
                this.m_info.removeChild(this.m_info.firstChild);

            this.m_info.appendChild(header);
            this.m_info.appendChild(colorLabel);
            this.m_info.appendChild(colorWrapper);
            if (qZoomIn)
                this.m_info.appendChild(qZoomIn);
            if (qZoomOut)
                this.m_info.appendChild(qZoomOut);
            if (md) {
                let dvd1 = document.createElement("div");
                dvd1.innerHTML = "<hr/>";
                let dvd2 = document.createElement("div");
                dvd2.innerHTML = "<hr/>";
                this.m_info.appendChild(dvd1);
                this.m_info.appendChild(md);
                this.m_info.appendChild(dvd2)
            }
            if (nodesList)
                this.m_info.appendChild(nodesList);
            if (hyperNodesList)
                this.m_info.appendChild(hyperNodesList);
        }

        public postListItem(list: HTMLElement)
        {
            this.m_cbInput = document.createElement("input");
            this.m_cbInput.type = "checkbox";
            this.m_cbInput.checked = this.m_isShown;
            this.m_cbInput.style.marginLeft = "18px";
            this.m_cbInput.onchange = () => {
                this.isShown = this.m_cbInput.checked;
                this.m_svRenderer.updateNodesVisibility();
            };

            this.m_selInput = document.createElement("input");
            this.m_selInput.type = "checkbox";
            this.m_selInput.checked = this.m_multiselected;
            this.m_selInput.style.marginLeft = "55px";
            this.m_selInput.style.marginRight = "18px";
            this.m_selInput.onchange = () => {
                this.m_svRenderer.multiselectNode(this);
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
            itm.appendChild(this.m_selInput);
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
                        this.m_marker.visible = false;
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
                        this.m_marker.visible = false;
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
                        this.m_marker.visible = false;
                        break;
                    }

                    case HighlightType.Multiselect: {
                        this.m_text.style.fontWeight = "normal";
                        this.m_text.text = this.label;
                        if (this.m_listLabel) {
                            this.m_listLabel.style.fontWeight = "normal";
                            this.m_listLabel.innerHTML = this.label;
                        }
                        this.alpha = Node.m_hoveredTextAlpha;
                        this.m_marker.visible = true;
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
            return this.m_customColor === null ? (this.parent as Scene).colors[this.groupID] : this.m_customColor;
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
            this.m_marker.beginFill(newColor, 1.0);
            this.m_marker.clear();
            this.m_marker.drawRect(this.m_markerRect.x, this.m_markerRect.y, this.m_markerRect.w, this.m_markerRect.h);
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

        public addHyperEdge(hyperEdge: HyperEdge)
        {
            this.m_hyperEdges.push(hyperEdge);
        }

        public clearEdges()
        {
            this.m_edges = [];
            this.m_hyperEdges = [];
            this.m_edgeBatches = [];
        }

        get edges(): Edge[]
        {
            return this.m_edges;
        }

        get hyperEdges(): HyperEdge[]
        {
            return this.m_hyperEdges;
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
            const p = this.parent as Scene;
            const w = Node.m_columnMinHeight +
                      (maxHeight - Node.m_columnMinHeight) / (p.nodeWeight.max - p.nodeWeight.min) *
                      (this.weight - p.nodeWeight.min);
            const s = this.scale.x > 0.0 ? 1.0 : -1.0;
            this.m_column.clear();
            this.m_column.drawRect(-w * x, -this.m_text.height * y, w, this.m_text.height);
            this.m_text.anchor.set(x, y);
            this.m_markerRect.w = Node.m_textPadding * 0.8;
            this.m_markerRect.h = this.m_text.height * 0.5;
            this.m_markerRect.x = -Node.m_textPadding * x + (Node.m_textPadding - this.m_markerRect.w) * (1.0 - x);
            this.m_markerRect.y = -this.m_markerRect.h * y;
            this.m_text.position.set(Node.m_textPadding * s, 0);
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
            this.m_hyperEdges.forEach((hyperEdge) => {
                if (hyperEdge.visible) {
                    hyperEdge.highlight = hl;
                    hyperEdge.nodes.forEach((node) => {
                        if (node !== this && !node.highlightSet)
                            node.highlight = hl;
                    });
                }
            });
        }

        public setHighlightForEdges(hl: HighlightType)
        {
            if (hl === HighlightType.None) {
                if (this.m_selectedEdge) {
                    this.m_selectedEdge.isGlowing = false;
                    this.m_selectedEdge = null;
                }
            }
            this.m_edges.forEach((edge) => {
                if (edge.visible)
                    edge.highlight = hl;
            });
        }

        public labelSize(normalize: boolean): { width: number, height: number }
        {
            let w = 0.0;
            let h = 0.0;
            if (this.m_text.style.fontWeight === "normal" || !normalize) {
                w = this.m_text.width;
                h = this.m_text.height;
            } else {
                this.m_text.style.fontWeight = "normal";
                this.m_text.text = this.label;
                w = this.m_text.width;
                h = this.m_text.height;
                this.m_text.style.fontWeight = "bold";
                this.m_text.text = "[-" + this.label + "-]";
            }
            return { width: w / 2.0 + Node.m_textPadding, height: h / 2.0 - 5.0 };
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

        get multiselected(): boolean
        {
            return this.m_multiselected;
        }

        set multiselected(ms: boolean)
        {
            this.m_multiselected = ms;
            if (this.m_selInput)
                this.m_selInput.checked = ms; // Does not invoke onChange.
        }

        get customColor(): number
        {
            return this.m_customColor;
        }

        set customColor(c: number)
        {
            this.m_customColor = c;
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

        private getHyperEdgeByPosition(x: number, y: number, s: number): HyperEdge
        {
            if (isNaN(x) || isNaN(y))
                return null;
            const d = x * x + y * y;
            const r = this.m_svRenderer.radius;
            const inRing = r * r * s * s;
            if (d < inRing) {
                for (let i = this.hyperEdges.length - 1; i >= 0; --i) {
                    if (this.hyperEdges[i].visible && this.hyperEdges[i].hitTest(x / s, y / s))
                        return this.hyperEdges[i];
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
                    if (this.m_hoveredEdge && this.m_hoveredEdge !== this.m_selectedEdge)
                        this.m_hoveredEdge.isGlowing = false;
                    if (this.m_hoveredHyperEdge && this.m_hoveredHyperEdge !== this.m_selectedHyperEdge) {
                        this.m_hoveredHyperEdge.isGlowing = false;
                        this.m_hoveredHyperEdge = null;
                    }
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
                    if (this.m_hoveredEdge !== this.m_selectedEdge)
                        this.m_hoveredEdge.isGlowing = false;
                    this.m_hoveredEdge = null;
                    if ($(".scivi_graph_tooltip")[0]["host"] === this) {
                        $(".scivi_graph_tooltip").stop(true);
                        $(".scivi_graph_tooltip").fadeOut(100);
                    }
                    return true;
                }

                let hoveredHyperEdge = this.getHyperEdgeByPosition(x, y, s);
                if (hoveredHyperEdge) {
                    if (this.m_hoveredHyperEdge !== hoveredHyperEdge) {
                        if (this.m_hoveredHyperEdge && this.m_hoveredHyperEdge !== this.m_selectedHyperEdge)
                            this.m_hoveredHyperEdge.isGlowing = false;
                        this.m_hoveredHyperEdge = hoveredHyperEdge;
                        this.m_hoveredHyperEdge.isGlowing = true;
                        // if (this.m_hoveredEdge.tooltip)
                        //     $(".scivi_graph_tooltip").html(this.m_hoveredEdge.tooltip);
                        // else
                            $(".scivi_graph_tooltip").html(this.m_hoveredHyperEdge.weight.toString());
                        $(".scivi_graph_tooltip").css({top: gy, left: gx + offset});
                        $(".scivi_graph_tooltip").stop(true);
                        $(".scivi_graph_tooltip").fadeIn(100);
                        $(".scivi_graph_tooltip")[0]["host"] = this;
                        return true;
                    }
                    $(".scivi_graph_tooltip").css({top: gy, left: gx + offset, position: "absolute"});
                    return false;
                } else {
                    if (this.m_hoveredHyperEdge) {
                        if (this.m_hoveredHyperEdge !== this.m_selectedHyperEdge)
                            this.m_hoveredHyperEdge.isGlowing = false;
                        this.m_hoveredHyperEdge = null;
                        if ($(".scivi_graph_tooltip")[0]["host"] === this) {
                            $(".scivi_graph_tooltip").stop(true);
                            $(".scivi_graph_tooltip").fadeOut(100);
                        }
                        return true;
                    }
                }
            }
            return false;
        }

        public handleClick(): boolean
        {
            let result = false;

            if (this.m_hoveredEdge) {
                if (this.m_selectedEdge === this.m_hoveredEdge)
                    this.m_selectedEdge = null;
                else {
                    if (this.m_selectedEdge) {
                        this.m_selectedEdge.isGlowing = false;
                    }
                    this.m_selectedEdge = this.m_hoveredEdge;
                    if (this.m_selectedHyperEdge === this.m_hoveredHyperEdge) {
                        this.m_selectedHyperEdge.isGlowing = false;
                        this.m_selectedHyperEdge = null;
                        this.m_hoveredHyperEdge = null;
                    }
                }
                result = true;
            } else {
                if (this.m_selectedEdge) {
                    this.m_selectedEdge.isGlowing = false;
                    this.m_selectedEdge = null;
                    result = true;
                }
            }

            if (this.m_hoveredHyperEdge) {
                if (this.m_selectedHyperEdge === this.m_hoveredHyperEdge)
                    this.m_selectedHyperEdge = null;
                else {
                    if (this.m_selectedHyperEdge) {
                        this.m_selectedHyperEdge.isGlowing = false;
                    }
                    this.m_selectedHyperEdge = this.m_hoveredHyperEdge;
                }
                result = true;
            } else {
                if (this.m_selectedHyperEdge) {
                    this.m_selectedHyperEdge.isGlowing = false;
                    this.m_selectedHyperEdge = null;
                    result = true;
                }
            }

            return result;
        }

        get selectedEdge(): Edge
        {
            return this.m_selectedEdge;
        }

        get selectedHyperEdge(): HyperEdge
        {
            return this.m_selectedHyperEdge;
        }

        public deleteSelectedEdge()
        {
            this.m_selectedEdge = null;
            this.m_hoveredEdge = null;
            if ($(".scivi_graph_tooltip")[0]["host"] === this) {
                $(".scivi_graph_tooltip").stop(true);
                $(".scivi_graph_tooltip").fadeOut(100);
            }
        }

        public deleteSelectedHyperEdge()
        {
            this.m_selectedHyperEdge = null;
            this.m_hoveredHyperEdge = null;
            if ($(".scivi_graph_tooltip")[0]["host"] === this) {
                $(".scivi_graph_tooltip").stop(true);
                $(".scivi_graph_tooltip").fadeOut(100);
            }
        }

        public positionHash(): string
        {
            return this.x + ":" + this.y;
        }
    }
}
