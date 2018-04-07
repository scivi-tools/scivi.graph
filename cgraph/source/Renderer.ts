namespace SciViCGraph
{
    export enum HighlightType
    {
        None = 0,
        Hover,
        Selection
    }

    export function color2string(c: number): string
    {
        return "#" + 
               (c >> 20 & 0xF).toString(16) + 
               (c >> 16 & 0xF).toString(16) + 
               (c >> 12 & 0xF).toString(16) + 
               (c >> 8 & 0xF).toString(16) +
               (c >> 4 & 0xF).toString(16) +
               (c & 0xF).toString(16);
    }

    export function string2color(s: string): number
    {
        if (s.length !== 7)
            return 0;
        let result = 0;
        s = s.toLowerCase();
        const zCode = "0".charCodeAt(0);
        const nCode = zCode + 9;
        const aCode = "a".charCodeAt(0);
        const fCode = aCode + 5;
        for (let i = 1; i < s.length; ++i) {
            let c = s.charCodeAt(i);
            if (c >= zCode && c <= nCode)
                c -= zCode;
            else if (c >= aCode && c <= fCode)
                c -= aCode - 10;
            else
                return 0;
            result |= c << (4 * (s.length - i - 1));
        }
        return result;
    }

    type Range = { min: number, max: number };

    export class Renderer
    {
        private m_renderer: PIXI.SystemRenderer;
        private m_stage: Scene;
        private m_renderingCache: RenderingCache;
        private m_currentState: number;
        private m_data: GraphData[];
        private m_dataStack: GraphData[][];
        private m_colors: number[];
        private m_edgeBatches: EdgeBatch[];
        private m_nodeWeight: Range;
        private m_edgeWeight: Range;
        private m_radius: number;
        private m_totalRadius: number;
        private m_hoveredNode: Node;
        private m_selectedNode: Node;
        private m_highlightedGroup: number;
        private m_clickCaught: boolean;
        private m_clicked: boolean;
        private m_mousePressed: boolean;
        private m_panning: boolean;
        private m_panPrevX: number;
        private m_panPrevY: number;
        private m_maxTextLength: number;
        private m_scaleLevels: Scale[];
        private m_ringScales: RingScale[];
        private m_statistics: Stats;
        private m_nodesList: List;
        private m_zoomTimerID: any;
        private m_nodesFontSize: number;
        private m_ringScaleFontSize: number;
        private m_draggedNodeIndex: number;
        private m_nodePlaceHolder: NodePlaceHolder;
        private m_nodeBorder: NodeBorder;

        static readonly m_ringScaleWidth = 30;
        static readonly m_minFontSize = 5;
        static readonly m_maxFontSize = 50;

        constructor(private m_view: HTMLElement, 
                    private m_info: HTMLElement, 
                    private m_list: HTMLElement,
                    private m_settings: HTMLElement,
                    private m_stats: HTMLElement,
                    private m_stateline: HTMLElement,
                    private m_localizer: {})
        {
            this.m_scaleLevels = null;
            this.m_ringScales = null;
            this.m_zoomTimerID = null;
            this.m_dataStack = null;
            this.m_nodesFontSize = 24;
            this.m_ringScaleFontSize = 36;
            this.m_currentState = 0;
            this.m_draggedNodeIndex = -1;
            this.m_nodePlaceHolder = null;
            this.m_nodeBorder = null;
            this.m_renderingCache = null;

            let tooltip = document.createElement("div");
            tooltip.className = "scivi_graph_tooltip";
            m_view.parentElement.parentElement.appendChild(tooltip)
            $(".scivi_graph_tooltip").hide(0);

            this.clearSelected();
        }

        public setInput(states: GraphData[], colors: number[])
        {
            this.m_data = states;
            this.m_colors = colors;
        }

        public run()
        {
            let settings = {
                transparent: false,
                antialias: false,
                resolution: window.devicePixelRatio,
                autoResize: true,
                roundPixels: false,
                backgroundColor: 0xFFFFFF
            };

            this.m_renderer = PIXI.autoDetectRenderer(this.m_view.offsetWidth, this.m_view.offsetHeight, settings);
            this.m_view.appendChild(this.m_renderer.view);

            this.m_renderer['plugins']['interaction']['moveWhenInside'] = true;

            this.m_nodesList = new List(this.m_list);
            this.m_statistics = new Stats(this.m_stats, this);

            this.init();
        }

        private currentData(): GraphData
        {
            return this.m_data[this.m_currentState];
        }

        private calcWeights()
        {
            this.m_nodeWeight = { min: undefined, max: undefined };
            this.m_edgeWeight = { min: undefined, max: undefined };

            this.currentData().nodes.forEach((node) => {
                if (this.m_nodeWeight.min === undefined || this.m_nodeWeight.min > node.weight)
                    this.m_nodeWeight.min = node.weight;
                if (this.m_nodeWeight.max === undefined || this.m_nodeWeight.max < node.weight)
                    this.m_nodeWeight.max = node.weight;
            });
            this.currentData().edges.forEach((edge) => {
                if (this.m_edgeWeight.min === undefined || this.m_edgeWeight.min > edge.weight)
                    this.m_edgeWeight.min = edge.weight;
                if (this.m_edgeWeight.max === undefined || this.m_edgeWeight.max < edge.weight)
                    this.m_edgeWeight.max = edge.weight;
            });
        }

        private createStage()
        {
            this.m_stage = new Scene(this.m_colors, this.m_edgeWeight.max, this.m_nodeWeight.max);
            this.m_renderingCache = new RenderingCache(this.m_stage, this.m_renderer);
        }

        private createGraph()
        {
            this.calcMaxTextLength();
            this.createRingScale();
            this.createNodes();
            this.createEdges();
            this.createCache();

            this.m_nodesList.buildList(this.currentData().nodes, this);
            this.m_statistics.buildChart(this.currentData().nodes, this.m_stage.colors);
        }

        private init()
        {
            this.calcWeights();
            this.createStage();

            this.m_hoveredNode = null;
            this.m_selectedNode = null;
            this.m_highlightedGroup = undefined;

            this.m_clickCaught = false;
            this.m_clicked = false;
            
            this.m_mousePressed = false;
            this.m_panning = false;
            this.m_panPrevX = 0;
            this.m_panPrevY = 0;

            this.createGraph();

            this.initInterface();

            this.updateRenderingCache(true);
            this.m_renderingCache.transit();
        }

        private reinit(animated: boolean)
        {
            this.calcWeights();
            this.createStage();
            
            if (this.m_selectedNode != null)
                this.m_selectedNode = this.getNodeByID(this.m_selectedNode.id);

            this.currentData().nodes.forEach((node) => {
                node.fontSize = this.m_nodesFontSize;
            });

            this.m_nodePlaceHolder = null;
            this.m_nodeBorder = null;

            this.createGraph();

            this.currentData().nodes.forEach((node) => {
                node.invalidate();
            });

            if (animated) {
                this.updateRenderingCache(true);
                this.m_renderingCache.transit();
            } else {
                this.render(true, true);
            }
            if (this.m_selectedNode != null)
                this.m_selectedNode.postInfo();
        }

        private getNodeByID(id: number): Node
        {
            let nodes = this.currentData().nodes;
            for (let i = 0, n = nodes.length; i < n; ++i) {
                if (nodes[i].id == id)
                    return nodes[i];
            }
            return null;
        }

        private getAngularIndex(x: number, y: number): number
        {
            let a = Math.atan2(y, x);
            if (a < 0.0)
                a += 2.0 * Math.PI;
            let index = Math.round(a * this.currentData().nodes.length / (2.0 * Math.PI));
            if (index < 0 || index >= this.currentData().nodes.length)
                index = 0;
            return index;
        }

        private getNodeIndexByPosition(x: number, y: number, s: number, isInRing?: boolean[]): number
        {
            let d = x * x + y * y;
            let r = this.m_radius;
            s *= s;
            let inRing = r * r * s;
            r += this.m_maxTextLength;
            let outRing = r * r * s;
            if (isInRing)
                isInRing[0] = d < inRing;
            if (d > inRing && d < outRing) {
                return this.getAngularIndex(x, y);
            }
            return -1;
        }

        private getNodeByPosition(x: number, y: number, s: number, isInRing?: boolean[]): Node
        {
            const index = this.getNodeIndexByPosition(x, y, s, isInRing);
            return index >= 0 ? this.currentData().nodes[index] : null;
        }

        private clearSelected()
        {
            if (this.m_selectedNode)
                this.m_selectedNode.handleCursorMove(NaN, NaN, NaN, NaN, NaN);
            this.m_selectedNode = null;
            while (this.m_info.firstChild)
                this.m_info.removeChild(this.m_info.firstChild);
            let dv = document.createElement("div");
            dv.innerHTML = this.m_localizer["LOC_SELSTUB"];
            this.m_info.appendChild(dv);
        }

        private initInterface()
        {
            window.addEventListener("resize", () => { this.reshape(); });

            let updateZoom = () => {
                let x = this.m_renderingCache.x;
                let y = this.m_renderingCache.y;
                let s = this.m_renderingCache.currentScale();
                this.m_stage.scale.set(s, s);
                this.createCache();
                this.m_renderingCache.x = x;
                this.m_renderingCache.y = y;
                this.render(true, true);
            };

            let onWheel = (e) => {
                e = e || window.event;
                let delta = e.deltaY || e.detail || e.wheelDelta;

                if (delta != undefined) {
                    if (this.m_zoomTimerID != null)
                        clearTimeout(this.m_zoomTimerID);

                    const d = 1.05;
                    let s = this.m_renderingCache.scale * (delta > 0 ? 1 / d : d);
                    let minS = 0.1 / this.m_stage.scale.x;
                    let maxS = 1.0 / this.m_stage.scale.x;
                    if (s < minS)
                        s = minS;
                    else if (s > maxS)
                        s = maxS;
                    let ds = 1.0 - s / this.m_renderingCache.scale;
                    let dx = (e.clientX - this.m_renderingCache.x) * ds;
                    let dy = (e.clientY - this.m_renderingCache.y) * ds;
                    this.m_renderingCache.scale = s;
                    this.m_renderingCache.x += dx;
                    this.m_renderingCache.y += dy;
                    this.render(true, false);

                    this.m_zoomTimerID = setTimeout(updateZoom, 60);
                }
            };

            let onMouseMove = (e) => {
                e = e || window.event;
                if (this.m_mousePressed) {
                    if (this.m_draggedNodeIndex === -1)
                        this.panGraph(e.clientX, e.clientY);
                    else
                        this.dragNode(e.clientX, e.clientY);
                } else {
                    this.hoverGraph(e.clientX, e.clientY);
                }
            };

            let onMouseOut = () => {
                this.m_hoveredNode = null;
                let f = false;
                if (this.m_ringScales) {
                    this.m_ringScales.forEach((rs) => {
                        const rsf = rs.dropHighlight();
                        f = f || rsf;
                    });
                }
                if (this.m_draggedNodeIndex !== -1) {
                    this.stopDragNode();
                    f = true;
                }
                this.m_mousePressed = false;
                this.m_panning = false;
                this.render(f, true);
            };

            let onMouseDown = (e) => {
                e = e || window.event;
                this.m_mousePressed = true;
                if (!this.startDragNode(e.clientX, e.clientY)) {
                    // If not drag, then pan.
                    this.m_panPrevX = e.clientX;
                    this.m_panPrevY = e.clientY;
                }
            };

            let onMouseUp = (e) => {
                this.m_mousePressed = false;
                if (!this.m_panning) {
                    e = e || window.event;
                    if (!this.dropNode(e.clientX, e.clientY)) {
                        this.m_clickCaught = true;
                        let isInRing = [ false ];
                        let node = this.getNodeByPosition(e.clientX - this.m_renderingCache.x, 
                                                          e.clientY - this.m_renderingCache.y,
                                                          this.m_renderingCache.currentScale(),
                                                          isInRing);
                        if (!isInRing[0])
                            this.selectNode(node);
                    }
                }
                this.m_panning = false;
            };

            this.m_view.onmousemove = onMouseMove;
            this.m_view.onmouseout = onMouseOut;
            this.m_view.onmousedown = onMouseDown;
            this.m_view.onmouseup = onMouseUp;
            this.m_view.onwheel = onWheel;

            this.m_settings.innerHTML = 
            "<div>" + this.m_localizer["LOC_EDGETHRESHOLD"] + "&nbsp;<span id='scivi_edge_treshold'>" +
                this.m_edgeWeight.min.toString() + " .. " + this.m_edgeWeight.max.toString() + "</span></div>" +
                "<div id='scivi_edge_treshold_slider' style='margin: 10px 10px 10px 5px'></div>" +
            "<div>" + this.m_localizer["LOC_NODETHRESHOLD"] + "&nbsp;<span id='scivi_node_treshold'>" +
                this.m_nodeWeight.min.toString() + " .. " + this.m_nodeWeight.max.toString() + "</span></div>" +
                "<div id='scivi_node_treshold_slider' style='margin: 10px 10px 10px 5px'></div><br/><hr/><br/>" +
            "<div>" + this.m_localizer["LOC_PASSIVETEXTALPHA"] + "&nbsp;<span id='scivi_node_alpha'>" +
                Node.passiveTextAlpha.toString() + "</span></div>" +
                "<div id='scivi_node_alpha_slider' style='margin: 10px 10px 10px 5px'></div>" +
            "<div>" + this.m_localizer["LOC_PASSIVEEDGEALPHA"] + "&nbsp;<span id='scivi_edge_alpha'>" +
                Edge.passiveEdgeAlpha.toString() + "</span></div>" +
                "<div id='scivi_edge_alpha_slider' style='margin: 10px 10px 10px 5px'></div><br/><hr/><br/>" +
            "<table><tr><td>" +
                "<table>" +
                    "<tr><td>" + this.m_localizer["LOC_NODEFONT"] + "</td><td><input id='scivi_nodes_font' style='width:50px' type='number' min='" +
                        Renderer.m_minFontSize.toString() + "' max='" + Renderer.m_maxFontSize.toString() +
                        "' value='" + this.m_nodesFontSize.toString() + "' required/></td></tr>" +
                    "<tr><td>" + this.m_localizer["LOC_RINGFONT"] + "</td><td><input id='scivi_ring_font' style='width:50px' type='number' min='" +
                        Renderer.m_minFontSize.toString() + "' max='" + Renderer.m_maxFontSize.toString() +
                        "' value='" + this.m_ringScaleFontSize.toString() + "' required/></td></tr>" +
                "</table>" +
                    "</td><td>" +
                        "<input id='scivi_apply_fonts' type='button' value='" + this.m_localizer["LOC_APPLY"] + "'/>" +
                "</td></tr></table>";

            $("#scivi_edge_treshold_slider").slider({
                min: this.m_edgeWeight.min,
                max: this.m_edgeWeight.max,
                range: true,
                values: [this.m_edgeWeight.min, this.m_edgeWeight.max],
                step: 1,
                slide: (event, ui) => { this.changeEdgeTreshold(ui.values); }
            });

            $("#scivi_node_treshold_slider").slider({
                min: this.m_nodeWeight.min,
                max: this.m_nodeWeight.max,
                range: true,
                values: [this.m_nodeWeight.min, this.m_nodeWeight.max],
                step: 1,
                slide: (event, ui) => { this.changeNodeTreshold(ui.values); }
            });

            $("#scivi_node_alpha_slider").slider({
                min: 0,
                max: 1,
                range: false,
                value: Node.passiveTextAlpha,
                step: 0.1,
                slide: (event, ui) => { this.changeNodeAlpha(ui.value); }
            });

            $("#scivi_edge_alpha_slider").slider({
                min: 0,
                max: 1,
                range: false,
                value: Edge.passiveEdgeAlpha,
                step: 0.1,
                slide: (event, ui) => { this.changeEdgeAlpha(ui.value); }
            });

            let applyFonts = $("#scivi_apply_fonts")[0];
            let nodesFSInput = $("#scivi_nodes_font")[0] as HTMLInputElement;
            let ringFSInput = $("#scivi_ring_font")[0] as HTMLInputElement;
            applyFonts.onclick = () => {
                console.log(ringFSInput.value);
                let nodesFS = parseFloat(nodesFSInput.value);
                let ringFS = parseFloat(ringFSInput.value);
                if (!isNaN(nodesFS) && !isNaN(ringFS) &&
                    nodesFS >= Renderer.m_minFontSize && nodesFS <= Renderer.m_maxFontSize && nodesFS === Math.round(nodesFS) &&
                    ringFS >= Renderer.m_minFontSize && ringFS <= Renderer.m_maxFontSize && ringFS === Math.round(ringFS)) {
                    this.m_nodesFontSize = nodesFS;
                    this.m_ringScaleFontSize = ringFS;
                    this.reinit(false);
                }
            };

            if (this.m_stateline)
            {
                this.m_stateline.innerHTML = "<div id='scivi_stateline_slider' class='scivi_stateline' style='width=100%'></div>";
                $("#scivi_stateline_slider").slider({
                    value: this.m_currentState,
                    min: 0,
                    max: this.m_data.length - 1,
                    step: 1,
                    slide: (event, ui) => { this.changeCurrentState(ui.value); }
                }).each(() => {
                    let n = this.m_data.length - 1;
                    for (let i = 0; i <= n; ++i) {
                        let el = $("<label><span style='color: #c5c5c5;'>|</span><br/>" + this.m_data[i].label + "</label>").css("left", (i / n * 100) + "%");
                        $("#scivi_stateline_slider").append(el);
                    }
                });
            }
        }

        private calcMaxTextLength()
        {
            this.m_maxTextLength = 0;
            let maxTextHeight = 0;
            let ww = this.currentData().nodes.length < 40;
            this.currentData().nodes.forEach((node) => {
                node.wordWrap = ww;
                let s = node.labelSize();
                if (s.width > this.m_maxTextLength)
                    this.m_maxTextLength = s.width;
                if (s.height > maxTextHeight)
                    maxTextHeight = s.height;
            });
            if (this.m_maxTextLength < 50)
                this.m_maxTextLength = 50;

            this.m_maxTextLength += 20;

            this.m_radius = (Math.max(this.currentData().nodes.length * maxTextHeight, 1500)) / (2.0 * Math.PI);
            let rsWidth = this.m_scaleLevels ? Renderer.m_ringScaleWidth * this.m_scaleLevels.length : 0.0;
            this.m_totalRadius = this.m_radius + this.m_maxTextLength + rsWidth;
        }

        private createNodes()
        {
            const angleStep = 2.0 * Math.PI / this.currentData().nodes.length;
            const radius = Math.min(this.m_view.offsetWidth, this.m_view.offsetHeight) / 2.0;

            let s = radius / this.m_totalRadius;
            if (s > 1.0)
                s = 1.0;
            this.m_stage.scale.set(s, s);

            this.currentData().nodes.forEach((node: Node, i: number) => {
                let x = this.m_radius * Math.cos(i * angleStep);
                let y = this.m_radius * Math.sin(i * angleStep);

                this.m_stage.addChild(node);

                node.position.set(x, y);
                node.rotation = Math.atan2(-x, y) + Math.PI / 2;

                if (node.rotation > Math.PI / 2) {
                    node.scale.set(-0.5, -0.5);
                    node.setAnchor(1.0, 0.5, this.m_maxTextLength);
                    node.align = "right";
                } else {
                    node.scale.set(0.5, 0.5);
                    node.setAnchor(0.0, 0.5, this.m_maxTextLength);
                    node.align = "left";
                }

                node.highlight = HighlightType.None;
                node.info = this.m_info;
                node.svRenderer = this;
            });
        }

        private createEdges()
        {
            this.currentData().nodes.forEach((node) => {
                node.clearEdges();
            });

            this.currentData().edges.forEach((edge) => {
                edge.source.addEdge(edge);
            });

            this.m_edgeBatches = [];
            this.currentData().nodes.forEach((node) => {
                node.edgeBatches.forEach((batch) => {
                    this.m_stage.addChild(batch);
                    this.m_edgeBatches.push(batch);
                });
            });

            this.currentData().edges.forEach((edge) => {
                edge.highlight = HighlightType.None;
            });
        }

        private createRingScale()
        {
            if (this.m_scaleLevels === null || this.m_scaleLevels.length === 0)
                return;

            const angleStep = 2.0 * Math.PI / this.currentData().nodes.length;
            let radius = this.m_radius + this.m_maxTextLength + (this.m_scaleLevels.length - 0.5) * Renderer.m_ringScaleWidth;

            this.m_ringScales = [];

            for (let i = this.m_scaleLevels.length - 1; i >= 0; --i) {
                let scale = this.m_scaleLevels[i];

                let segment = { from: undefined, id: undefined, index: 0 };

                let rs = new RingScale(this.m_radius, radius, Renderer.m_ringScaleWidth, this.m_ringScaleFontSize, this.m_view);
                this.m_stage.addChild(rs);
                this.m_ringScales.push(rs);

                this.currentData().nodes.forEach((node: Node, i: number) => {
                    let stepID = scale.getStepID(node);
                    if (stepID != segment.id) {
                        let a = (i - 0.5) * angleStep;
                        if (segment.id !== undefined) {
                            rs.addSegment(segment.from, a, 
                                          scale.getColor(segment.index),
                                          scale.getTextColor(segment.index),
                                          scale.getName(segment.id));
                            segment.index++;
                        }
                        segment.from = a;
                        segment.id = stepID;
                    }
                });
                if (segment.id !== undefined) {
                    rs.addSegment(segment.from, 2.0 * Math.PI - 0.5 * angleStep,
                                  scale.getColor(segment.index),
                                  scale.getTextColor(segment.index),
                                  scale.getName(segment.id));
                }

                radius -= Renderer.m_ringScaleWidth;
            };
        }

        private createCache()
        {
            this.m_renderingCache.init(this.m_totalRadius, this.m_view.offsetWidth, this.m_view.offsetHeight);
        }

        public updateRenderingCache(force: boolean): boolean
        {
            let needsRender = force;

            if (this.m_clicked && !this.m_clickCaught)
                this.clearSelected();
            this.m_clicked = false;
            this.m_clickCaught = false;

            if (this.m_selectedNode != null) {
                this.m_selectedNode.highlight = HighlightType.Selection;
                this.m_selectedNode.setHighlightForEdgesAndTargetNodes(HighlightType.Hover);
            }
            if (this.m_hoveredNode != null && this.m_selectedNode != this.m_hoveredNode) {
                this.m_hoveredNode.highlight = HighlightType.Hover;
                this.m_hoveredNode.setHighlightForEdgesAndTargetNodes(HighlightType.Hover);
            }

            this.currentData().nodes.forEach((node) => {
                if (node.visible) {
                    if (node != this.m_selectedNode && node != this.m_hoveredNode) {
                        node.setHighlightForEdges(HighlightType.None);
                        if (this.m_highlightedGroup != undefined && node.groupID == this.m_highlightedGroup)
                            node.highlight = HighlightType.Hover;
                    }
                    let nr = node.prepare();
                    needsRender = needsRender || nr;
                }
            });

            this.m_edgeBatches.forEach((batch) => {
                let nr = batch.prepare();
                needsRender = needsRender || nr;
            });

            if (needsRender)
                this.m_renderingCache.update();

            return needsRender;
        }

        public render(force: boolean, updateCache: boolean)
        {
            if (updateCache)
                force = this.updateRenderingCache(force);
            if (force)
                this.m_renderingCache.render();
        }

        public reshape()
        {
            this.m_renderer.resize(this.m_view.offsetWidth, this.m_view.offsetHeight);
            this.render(true, true);
        }

        public changeActiveGroupColor(newColor: string)
        {
            if (this.m_selectedNode) {
                let focusGroup = this.m_selectedNode.groupID;
                this.m_stage.colors[focusGroup] = string2color(newColor);
                this.reinit(false);
            }
        }

        public changeGroupColor(focusGroup: number, newColor: string)
        {
            this.m_stage.colors[focusGroup] = string2color(newColor);
            this.reinit(false);
        }

        public quasiZoomIn(groupID: number)
        {
            let newData = [];

            this.m_data.forEach((state) => {
                let newNodes = [];
                state.nodes.forEach((node) => {
                    if (node.groupID == groupID)
                        newNodes.push(node);
                });

                let newEdges = [];
                state.edges.forEach((edge) => {
                    if (edge.source.groupID == groupID  && edge.target.groupID == groupID)
                        newEdges.push(edge);
                });

                newData.push(new GraphData(state.label, newNodes, newEdges));
            });

            if (this.m_dataStack == null)
                this.m_dataStack = [];
            this.m_dataStack.push(this.m_data);
            this.m_data = newData;

            this.reinit(true);
        }

        public quasiZoomOut()
        {
            this.m_data = this.m_dataStack.pop();

            this.reinit(true);
        }

        public canQuasiZoomIn(): boolean
        {
            return this.m_dataStack == null || this.m_dataStack.length == 0;
        }

        public canQuasiZoomOut(): boolean
        {
            return this.m_dataStack != null && this.m_dataStack.length > 0;
        }

        public highlightGroup(groupID: number)
        {
            this.m_highlightedGroup = groupID;
            this.render(false, true);
        }

        public clearChartSelection()
        {
            this.m_statistics.clearSelection();
        }

        private filterEdges(): boolean
        {
            let result = false;
            this.currentData().edges.forEach((edge) => {
                let vis = edge.source.visible && edge.target.visible
                            && edge.weight >= this.m_edgeWeight.min
                            && edge.weight <= this.m_edgeWeight.max;
                if (vis != edge.visible) {
                    edge.visible = vis;
                    result = true;
                    if (edge.source == this.m_selectedNode || edge.target == this.m_selectedNode)
                        this.m_selectedNode.postInfo();
                }
            });
            return result;
        }

        private filterNodes(): boolean
        {
            let result = false;
            this.currentData().nodes.forEach((node) => {
                let vis = node.isShown &&
                          node.weight >= this.m_nodeWeight.min &&
                          node.weight <= this.m_nodeWeight.max;
                if (vis != node.visible) {
                    node.visible = vis;
                    result = true;
                    if (node == this.m_selectedNode)
                        this.m_clicked = true;
                }
            });
            return result;
        }

        public changeEdgeTreshold(values: number[])
        {
            $("#scivi_edge_treshold").text(values[0] + " .. " + values[1]);
            this.m_edgeWeight.min = values[0];
            this.m_edgeWeight.max = values[1];
            if (this.filterEdges())
                this.render(true, true);
        }

        public changeNodeTreshold(values: number[])
        {
            $("#scivi_node_treshold").text(values[0] + " .. " + values[1]);
            this.m_nodeWeight.min = values[0];
            this.m_nodeWeight.max = values[1];
            this.updateNodesVisibility();
        }

        public changeNodeAlpha(value: number)
        {
            $("#scivi_node_alpha").text(value);
            Node.passiveTextAlpha = value;
            this.currentData().nodes.forEach((node) => {
                node.invalidate();
            });
            this.render(true, true);
        }

        public changeEdgeAlpha(value: number)
        {
            $("#scivi_edge_alpha").text(value);
            Edge.passiveEdgeAlpha = value;
            this.currentData().nodes.forEach((node) => {
                node.invalidate();
            });
            this.render(true, true);
        }

        get scaleLevels(): Scale[]
        {
            return this.m_scaleLevels;
        }

        set scaleLevels(s: Scale[])
        {
            this.m_scaleLevels = s;
        }

        public hoverNode(node: Node)
        {
            this.m_hoveredNode = node;
            this.render(false, true);
        }

        public selectNode(node: Node)
        {
            if (node == null || node == this.m_selectedNode)
                this.clearSelected();
            else {
                this.m_selectedNode = node;
                this.m_selectedNode.postInfo();
            }
            this.render(false, true);
        }

        public updateNodesVisibility()
        {
            let r1 = this.filterNodes();
            let r2 = this.filterEdges();
            if (r1 || r2)
                this.render(true, true);
        }

        public showAllNodes(show: boolean)
        {
            this.currentData().nodes.forEach((node) => {
                node.isShown = show;
            });
            this.updateNodesVisibility();
        }

        public updateNodeNames()
        {
            this.reinit(false);
        }

        get radius(): number
        {
            return this.m_radius;
        }

        get localizer(): {}
        {
            return this.m_localizer;
        }

        private changeCurrentState(cs: number)
        {
            this.m_currentState = cs;
            this.reinit(false);
        }

        private panGraph(x: number, y: number)
        {
            let dx = x - this.m_panPrevX;
            let dy = y - this.m_panPrevY;
            let r = this.m_radius / 2.0;
            this.m_panPrevX = x;
            this.m_panPrevY = y;
            this.m_renderingCache.x += dx;
            this.m_renderingCache.y += dy;
            if (this.m_renderingCache.x < -r)
                this.m_renderingCache.x = -r;
            else if (this.m_renderingCache.x > this.m_view.offsetWidth + r)
                this.m_renderingCache.x = this.m_view.offsetWidth + r;
            if (this.m_renderingCache.y < -r)
                this.m_renderingCache.y = -r;
            else if (this.m_renderingCache.y > this.m_view.offsetHeight + r)
                this.m_renderingCache.y = this.m_view.offsetHeight + r;
            this.render(true, false);
            this.m_panning = true;
        }

        private hoverGraph(x: number, y: number)
        {
            let lx = x - this.m_renderingCache.x;
            let ly = y - this.m_renderingCache.y;
            let s = this.m_renderingCache.currentScale();
            this.m_hoveredNode = this.getNodeByPosition(lx, ly, s);
            let f1 = false
            if (this.m_selectedNode)
                f1 = this.m_selectedNode.handleCursorMove(lx, ly, s, x, y);
            let f2 = false;
            if (this.m_ringScales) {
                this.m_ringScales.forEach((rs) => {
                    const rsf = rs.handleCursorMove(lx, ly, s, x, y);
                    f2 = f2 || rsf;
                });
            }
            this.render(f1 || f2, true);
        }

        private startDragNode(x: number, y: number): boolean
        {
            const lx = x - this.m_renderingCache.x;
            const ly = y - this.m_renderingCache.y;
            const s = this.m_renderingCache.currentScale();
            this.m_draggedNodeIndex = this.getNodeIndexByPosition(lx, ly, s);
            if (this.m_draggedNodeIndex >= 0) {
                if (this.m_nodeBorder === null) {
                    this.m_nodeBorder = new NodeBorder();
                    this.m_stage.addChild(this.m_nodeBorder);
                }
                this.m_nodeBorder.showForNode(this.currentData().nodes[this.m_draggedNodeIndex]);
                this.render(true, true);
            }
            return this.m_draggedNodeIndex !== -1;
        }

        private dragNode(x: number, y: number)
        {
            const offset = 20;
            if (this.m_nodePlaceHolder && this.m_nodePlaceHolder.visible) {
                $(".scivi_graph_tooltip").css({ top: y, left: x + offset, position: "absolute" });
            } else {
                let draggingNode = this.currentData().nodes[this.m_draggedNodeIndex];
                $(".scivi_graph_tooltip").html(draggingNode.label);
                $(".scivi_graph_tooltip").css({ top: y, left: x + offset });
                $(".scivi_graph_tooltip").stop(true);
                $(".scivi_graph_tooltip").fadeIn(100);
                $(".scivi_graph_tooltip")[0]["host"] = this;
                if (!this.m_nodePlaceHolder) {
                    this.m_nodePlaceHolder = new NodePlaceHolder(this.m_radius, this.m_radius + this.m_maxTextLength);
                    this.m_stage.addChild(this.m_nodePlaceHolder);
                }
                this.m_nodePlaceHolder.visible = true;
            }
            const lx = x - this.m_renderingCache.x;
            const ly = y - this.m_renderingCache.y;
            const idx = this.getAngularIndex(lx, ly);
            const a = (idx - 0.5) * (2.0 * Math.PI / this.currentData().nodes.length);
            if (this.m_nodePlaceHolder.rotation !== a) {
                this.m_nodePlaceHolder.rotation = a;
                this.render(true, true);
            }
        }

        private dropNode(x: number, y: number): boolean
        {
            let result = false;
            if (this.m_draggedNodeIndex !== -1 && this.m_nodePlaceHolder && this.m_nodePlaceHolder.visible) {
                const lx = x - this.m_renderingCache.x;
                const ly = y - this.m_renderingCache.y;
                const idx = this.getAngularIndex(lx, ly);
                const dNode = this.currentData().nodes[this.m_draggedNodeIndex];
                this.currentData().nodes.splice(this.m_draggedNodeIndex, 1);
                this.currentData().nodes.splice(idx, 0, dNode);
                result = true;
            }
            this.stopDragNode();
            if (result)
                this.reinit(false);
            else
                this.render(true, true);
            return result;
        }

        private stopDragNode()
        {
            if (this.m_nodePlaceHolder)
                this.m_nodePlaceHolder.visible = false;
            if ($(".scivi_graph_tooltip")[0]["host"] === this) {
                $(".scivi_graph_tooltip").stop(true);
                $(".scivi_graph_tooltip").fadeOut(100);
            }
            this.m_draggedNodeIndex = -1;
            if (this.m_nodeBorder !== null)
                this.m_nodeBorder.showForNode(null);
        }
    }
}
