namespace SciViCGraph
{
    export enum HighlightType
    {
        None = 0,
        Hover,
        Selection,
        Multiselect
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

    export class Renderer
    {
        private m_renderer: PIXI.SystemRenderer;
        private m_stage: Scene;
        private m_renderingCache: RenderingCache;
        private m_currentStateKey: string;
        private m_states: GraphStates;
        private m_statesStack: GraphStates[];
        private m_colors: number[];
        private m_edgeBatches: EdgeBatch[];
        private m_transientEdgeBatch: EdgeBatch;
        private m_transientEdge: Edge;
        private m_transientEdgeSource: Node;
        private m_radius: number;
        private m_totalRadius: number;
        private m_hoveredNode: Node;
        private m_selectedNode: Node;
        private m_multiselectedNodes: Node[];
        private m_highlightedGroup: number;
        private m_clickCaught: boolean;
        private m_clicked: boolean;
        private m_mousePressed: boolean;
        private m_panning: boolean;
        private m_panPrevX: number;
        private m_panPrevY: number;
        private m_maxTextLength: number;
        private m_scaleLevels: Scale[];
        private m_applicableScaleLevelsCount: number;
        private m_classifier: Classifier;
        private m_ringScales: RingScale[];
        private m_statistics: Stats;
        private m_nodesList: NodesList;
        private m_zoomTimerID: any;
        private m_nodesFontSize: number;
        private m_ringScaleFontSize: number;
        private m_draggedNodeIndex: number;
        private m_nodePlaceHolder: NodePlaceHolder;
        private m_nodeBorder: NodeBorder;
        private m_cursorPos: Point;
        private m_draggedRingIndex: number;
        private m_ringPlaceHolder: RingPlaceHolder;
        private m_ringBorder: RingBorder;
        private m_ringSegmentFilterBothEnds: boolean;
        private m_ringScaleWithSegmentSelected: RingScale;
        private m_colorPicker: any;
        private m_modularityFilters: any[];
        private m_stateLineNav: StateLineNavigator;
        private m_stateCalc: Calculator;
        private m_filtersManager: FiltersManager;
        private m_edgesEditMode: boolean;
        private m_createDirectedEdges: boolean;
        private m_clickCount: number;
        private m_prompt: Prompt;
        private m_edgeSelector: EdgeSelector;

        static readonly m_ringScaleWidth = 30;
        static readonly m_minFontSize = 5;
        static readonly m_maxFontSize = 50;

        constructor(private m_view: HTMLElement, 
                    private m_info: HTMLElement, 
                    private m_listForNodes: HTMLElement,
                    private m_settings: HTMLElement,
                    private m_filters: HTMLElement,
                    private m_stats: HTMLElement,
                    private m_stateline: HTMLElement,
                    private m_treeView: HTMLElement,
                    private m_calculator: HTMLElement,
                    private m_localizer: {})
        {
            this.m_scaleLevels = null;
            this.m_applicableScaleLevelsCount = 0;
            this.m_classifier = null;
            this.m_ringScales = null;
            this.m_zoomTimerID = null;
            this.m_statesStack = null;
            this.m_edgeBatches = null;
            this.m_transientEdgeBatch = null;
            this.m_transientEdge = null;
            this.m_transientEdgeSource = null;
            this.m_nodesFontSize = 24;
            this.m_ringScaleFontSize = 36;
            this.m_currentStateKey = null;
            this.m_draggedNodeIndex = -1;
            this.m_nodePlaceHolder = null;
            this.m_nodeBorder = null;
            this.m_renderingCache = null;
            this.m_cursorPos = { x: undefined, y: undefined };
            this.m_draggedRingIndex = -1;
            this.m_ringPlaceHolder = null;
            this.m_ringBorder = null;
            this.m_ringSegmentFilterBothEnds = true;
            this.m_ringScaleWithSegmentSelected = null;
            this.m_colorPicker = null;
            this.m_modularityFilters = [];
            this.m_stateLineNav = new StateLineNavigator(this, this.m_stateline);
            this.m_stateCalc = new Calculator(this, this.m_calculator);
            this.m_filtersManager = new FiltersManager(this, this.m_filters);
            this.m_edgesEditMode = false;
            this.m_createDirectedEdges = false;
            this.m_clickCount = 0;
            this.m_prompt = new Prompt(m_view);
            this.m_edgeSelector = new EdgeSelector(this);

            let tooltip = document.createElement("div");
            tooltip.className = "scivi_graph_tooltip";
            m_view.parentElement.parentElement.appendChild(tooltip);
            $(".scivi_graph_tooltip").hide(0);

            this.clearSelected();
        }

        public setInput(states: GraphStates, colors: number[])
        {
            this.m_states = states;
            this.m_colors = colors;
            if (this.m_states.hasStates) {
                this.m_currentStateKey = "";
                for (let i = 0, n = this.m_states.stateLines.length; i < n; ++i) {
                    this.m_currentStateKey += "0"
                    if (i < n - 1)
                        this.m_currentStateKey += "|";
                }
            } else {
                this.m_currentStateKey = "0";
            }
        }

        public setColorPicker(cp: any)
        {
            this.m_colorPicker = cp;
        }

        public addModularityFilter(mf: any)
        {
            this.m_modularityFilters.push(mf);
        }

        public createColorPicker(options: {}): any
        {
            return new this.m_colorPicker(options);
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

            if (this.m_listForNodes)
                this.m_nodesList = new NodesList(this.m_listForNodes);
            if (this.m_stats)
                this.m_statistics = new Stats(this.m_stats, this);

            if (this.m_states.isDynamic)
                this.currentData() // Force state to load

            this.init();
        }

        private currentData(): GraphData
        {
            if (this.m_states.isDynamic) {
                if (!this.m_states.data["current"]) {
                    const parser = new Parser(this.m_states.dynamicSource.stateGetter(this.m_currentStateKey));
                    this.m_states.data["current"] = parser.graphData;
                }
                return this.m_states.data["current"];
            } else {
                return this.m_states.data[this.m_currentStateKey];
            }
        }

        get states(): GraphStates
        {
            return this.m_states;
        }

        get currentStateKey(): string
        {
            return this.m_currentStateKey;
        }

        private createStage()
        {
            this.m_stage = new Scene(this.m_colors, this.m_filtersManager.edgeWeight, this.m_filtersManager.nodeWeight);
            this.m_renderingCache = new RenderingCache(this.m_stage, this.m_renderer);
        }

        private createGraph(shouldFit: boolean)
        {
            this.checkRingScaleApplicability();
            this.calcMaxTextLength();
            this.createRingScale();
            this.createNodes();
            this.createEdges();
            if (shouldFit)
                this.fitScale();
            this.createCache();

            if (this.m_nodesList)
                this.m_nodesList.buildList(this.currentData().nodes, this);
        }

        private init()
        {
            this.m_filtersManager.calcWeights();
            this.createStage();

            this.m_hoveredNode = null;
            this.setSelectedNode(null);
            this.m_highlightedGroup = undefined;

            this.m_clickCaught = false;
            this.m_clicked = false;
            
            this.m_mousePressed = false;
            this.m_panning = false;
            this.m_panPrevX = 0;
            this.m_panPrevY = 0;

            this.createGraph(true);

            this.filterNodes();
            this.filterEdges();

            this.initInterface();

            this.updateRenderingCache(true);
            this.m_renderingCache.transit();
        }

        private reinit(animated: boolean, shouldFit: boolean)
        {
            const restorePos = !shouldFit && this.m_renderingCache !== null && this.m_renderingCache.isValid;
            let x = 0.0;
            let y = 0.0;
            let s = 1.0;
            if (restorePos) {
                x = this.m_renderingCache.x;
                y = this.m_renderingCache.y;
                s = this.m_stage.scale.x;
            }

            this.createStage();
            
            const selectedNodeID = this.m_selectedNode !== null ? this.m_selectedNode.id : undefined;

            this.currentData().nodes.forEach((node) => {
                node.fontSize = this.m_nodesFontSize;
            });

            this.m_nodePlaceHolder = null;
            this.m_nodeBorder = null;

            this.m_ringPlaceHolder = null;
            this.m_ringBorder = null;

            if (restorePos)
                this.m_stage.scale.set(s, s);

            this.createGraph(shouldFit);

            if (restorePos) {
                this.m_renderingCache.x = x;
                this.m_renderingCache.y = y;
            }

            this.currentData().nodes.forEach((node) => {
                node.invalidate(true);
            });

            this.filterNodes();
            this.filterEdges();

            if (selectedNodeID !== undefined)
                this.setSelectedNode(this.getNodeByID(selectedNodeID));

            if (animated) {
                this.updateRenderingCache(true);
                this.m_renderingCache.transit();
            } else {
                this.render(true, true);
            }
            if (this.m_selectedNode !== null)
                this.m_selectedNode.postInfo();
        }

        private getNodeByID(id: number): Node
        {
            let nodes = this.currentData().nodes;
            for (let i = 0, n = nodes.length; i < n; ++i) {
                if (nodes[i].id === id)
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

        private getRingIndexByPosition(x: number, y: number, s: number, radius?: number[]): number
        {
            if (this.m_ringScales) {
                const n = this.m_ringScales.length;
                for (let i = 0; i < n; ++i) {
                    if (this.m_ringScales[i].hitWithPoint(x, y, s)) {
                        if (radius)
                            radius[0] = this.m_ringScales[i].radius + this.m_ringScales[i].width / 2.0;
                        return i;
                    }
                }
                if (radius && n > 1) {
                    const r = this.m_ringScales[0].radius * s;
                    let i = 0;
                    if (x * x + y * y > r * r) {
                        radius[0] = this.m_ringScales[i].radius + this.m_ringScales[i].width / 2.0;
                        --i;
                    } else {
                        i = this.m_ringScales.length - 1;
                        radius[0] = this.m_ringScales[i].radius - this.m_ringScales[i].width / 2.0;
                        ++i;
                    }
                    return i;
                }
            }
            return -1;
        }

        private clearSelected()
        {
            this.m_edgeSelector.clearSelected();
            this.setSelectedNode(null);
            if (this.m_info) {
                while (this.m_info.firstChild)
                    this.m_info.removeChild(this.m_info.firstChild);
                let dv = document.createElement("div");
                dv.innerHTML = this.m_localizer["LOC_SELSTUB"];
                this.m_info.appendChild(dv);
            }
            this.clearMultiselection();
        }

        private clearMultiselection()
        {
            if (this.m_multiselectedNodes) {
                this.m_multiselectedNodes.forEach((node) => {
                    node.multiselected = false;
                });
            }
            this.m_multiselectedNodes = [];
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
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const delta = e.deltaY || e.detail || e.wheelDelta;

                if (delta !== undefined) {
                    if (this.m_zoomTimerID !== null)
                        clearTimeout(this.m_zoomTimerID);

                    const d = 1.05;
                    let s = this.m_renderingCache.scale * (delta > 0 ? 1 / d : d);
                    const minS = 0.1 / this.m_stage.scale.x;
                    const maxS = 1.0 / this.m_stage.scale.x;
                    if (s < minS)
                        s = minS;
                    else if (s > maxS)
                        s = maxS;
                    const ds = 1.0 - s / this.m_renderingCache.scale;
                    const dx = (x - this.m_renderingCache.x) * ds;
                    const dy = (y - this.m_renderingCache.y) * ds;
                    this.m_renderingCache.scale = s;
                    this.m_renderingCache.x += dx;
                    this.m_renderingCache.y += dy;
                    this.render(true, false);

                    this.m_zoomTimerID = setTimeout(updateZoom, 60);
                }
            };

            let onMouseMove = (e) => {
                e = e || window.event;
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.m_cursorPos.x = x;
                this.m_cursorPos.y = y;
                this.m_clickCount = 0;
                if (this.m_mousePressed) {
                    if (!e.shiftKey) {
                        if (this.m_edgesEditMode && this.m_transientEdgeSource) {
                            this.createTransientEdgeWithSourceNode(this.m_transientEdgeSource);
                            if (this.m_selectedNode !== this.m_transientEdgeSource) {
                                this.selectNode(this.m_transientEdgeSource);
                                this.clearMultiselection();
                            }
                            this.m_transientEdgeSource = null;
                        } if (this.m_edgesEditMode && this.m_transientEdgeBatch) {
                            this.changeTransientEdge();
                        } else if (this.m_draggedNodeIndex !== -1) {
                            this.dragNode(x, y);
                        } else if (this.m_draggedRingIndex !== -1) {
                            this.dragRing(x, y);
                        } else {
                            this.panGraph(x, y);
                        }
                    }
                } else {
                    if (!this.m_edgesEditMode && this.m_transientEdgeBatch)
                        this.changeTransientEdge();
                    else if (e.buttons === 0)
                        this.hoverGraph(x, y);
                }
            };

            let onMouseOut = () => {
                this.m_hoveredNode = null;
                let f = false;
                if (this.m_ringScales) {
                    this.m_ringScales.forEach((rs) => {
                        const rsf = rs.dropHighlight();
                        if (rsf)
                            this.contextMenuEnabled = false;
                        f = f || rsf;
                    });
                }
                if (this.m_draggedNodeIndex !== -1) {
                    this.stopDragNode();
                    f = true;
                }
                if (this.m_draggedRingIndex !== -1) {
                    this.stopDragRing();
                    f = true;
                }
                this.m_transientEdgeSource = null;
                this.dropTransientEdge();
                this.m_mousePressed = false;
                this.m_panning = false;
                this.render(f, true);
            };

            let onMouseDown = (e) => {
                e = e || window.event;
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.m_mousePressed = true;
                this.m_panning = false;
                if (!this.startDragNode(x, y) && !this.startDragRing(x, y)) {
                    // If not drag, then pan.
                    this.m_panPrevX = x;
                    this.m_panPrevY = y;
                }
            };

            let onMouseUp = (e) => {
                if (this.m_mousePressed) {
                    this.m_mousePressed = false;
                    if (!this.m_panning) {
                        e = e || window.event;
                        const rect = e.target.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        this.m_clickCount++;
                        if (this.m_clickCount === 2) {
                            this.renameSelectedEdge();
                        } else if (!this.dropNode(x, y) && !this.dropRing(x, y)) {
                            this.m_clickCaught = true;
                            let isInRing = [ false ];
                            const dx = x - this.m_renderingCache.x;
                            const dy = y - this.m_renderingCache.y;
                            const s = this.m_renderingCache.currentScale();
                            const node = this.getNodeByPosition(dx, dy, s, isInRing);
                            const shouldSelectNode = !isInRing[0] && !this.m_transientEdgeBatch && !(e.altKey && node == this.m_selectedNode);
                            if (shouldSelectNode) {
                                if (e.shiftKey)
                                    this.multiselectNode(node);
                                else {
                                    this.clearMultiselection();
                                    this.selectNode(node);
                                }
                            }
                            if (node) {
                                if (!this.m_transientEdgeBatch) {
                                    if (e.altKey) {
                                        this.createTransientEdgeWithSourceNode(node);
                                    }
                                } else {
                                    this.commitTransientEdge();
                                }
                            } else {
                                this.dropTransientEdge();
                                if (e.shiftKey) {
                                    this.m_ringSegmentFilterBothEnds = false;
                                    this.selectRingSegment();
                                } else if (e.altKey) {
                                    this.m_ringSegmentFilterBothEnds = true;
                                    this.selectRingSegment();
                                }
                                this.selectEdge();
                            }
                        }
                    }
                    this.m_panning = false;
                }
            };

            this.m_view.onmousemove = onMouseMove;
            this.m_view.onmouseout = onMouseOut;
            this.m_view.onmousedown = onMouseDown;
            this.m_view.onmouseup = onMouseUp;
            this.m_view.onwheel = onWheel;

            $.contextMenu({
                selector: "#" + this.m_view.id,
                items: {
                    add: {
                        name: this.m_localizer["LOC_RING_FILTER_ADD"],
                        callback: (key, opt) => {
                            this.addEqualizerItem();
                        }
                    },
                    arcs: {
                        name: this.m_localizer["LOC_RING_FILTER_ARCS_GROUP"],
                        items: {
                            single: {
                                name: this.m_localizer["LOC_RING_FILTER_ARCS_GROUP_SINGLE"],
                                callback: (key, opt) => {
                                    this.m_ringSegmentFilterBothEnds = false;
                                    this.selectRingSegment();
                                }
                            },
                            both: {
                                name: this.m_localizer["LOC_RING_FILTER_ARCS_GROUP_BOTH"],
                                callback: (key, opt) => {
                                    this.m_ringSegmentFilterBothEnds = true;
                                    this.selectRingSegment();
                                }
                            }
                        }
                    },
                    paint: {
                        name: this.m_localizer["LOC_RING_PAINT_NODES"],
                        callback: (key, opt) => {
                            this.paintNodesByRingSegment();
                        }
                    }
                }
            });

            this.contextMenuEnabled = false;

            if (this.m_settings) {
                this.m_settings.innerHTML = 
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
                            "<div id='scivi_apply_fonts' class='scivi_button'>" + this.m_localizer["LOC_APPLY"] + "</div>" +
                    "</td></tr></table><br/><hr/><br/>" +
                "<div id='scivi_fit_to_screen' class='scivi_button'>" + this.m_localizer["LOC_FIT_TO_SCREEN"] + "</div>" +
                "<div id='scivi_sort_by_ring' class='scivi_button'>" + this.m_localizer["LOC_SORT_BY_RING"] + "</div>" +
                "<div id='scivi_calc_modularity' class='scivi_button'>" + this.m_localizer["LOC_CALC_MODULARITY"] + "</div>" +
                "<div id='scivi_sort_by_modularity' class='scivi_button'>" + this.m_localizer["LOC_SORT_BY_MODULARITY"] + "</div>" +
                "<div id='scivi_save_graph' class='scivi_button'>" + this.m_localizer["LOC_SAVE_GRAPH"] + "</div>" +
                "<br/><br/><hr/><br/><div>" + 
                    "<span><input id='scivi_edge_edit' type='checkbox' value='" + (this.edgesEditMode ? "checked" : "") + "'/><span>" + this.m_localizer["LOC_EDGE_EDIT"] + "</span></span>" +
                    "&nbsp;&nbsp;&nbsp;&nbsp;" +
                    "<span><input id='scivi_create_directed_edges' type='checkbox' value='" + (this.createDirectedEdges ? "checked" : "") + "'/><span>" + this.m_localizer["LOC_CREATE_DIRECTED_EDGES"] + "</span></span>" +
                "</div>" +
                "<br/><hr/><br/><div class='scivi_button' onclick='window.location.href = \"" + this.m_localizer["LOC_HELPLOC"] + "\"'>" + this.m_localizer["LOC_HELP"] + "</div>";

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

                const nodesFSInput = $("#scivi_nodes_font")[0] as HTMLInputElement;
                const ringFSInput = $("#scivi_ring_font")[0] as HTMLInputElement;
                $("#scivi_apply_fonts").click(() => {
                    const nodesFS = parseFloat(nodesFSInput.value);
                    const ringFS = parseFloat(ringFSInput.value);
                    if (!isNaN(nodesFS) && !isNaN(ringFS) &&
                        nodesFS >= Renderer.m_minFontSize && nodesFS <= Renderer.m_maxFontSize && nodesFS === Math.round(nodesFS) &&
                        ringFS >= Renderer.m_minFontSize && ringFS <= Renderer.m_maxFontSize && ringFS === Math.round(ringFS)) {
                        this.m_nodesFontSize = nodesFS;
                        this.m_ringScaleFontSize = ringFS;
                        this.reinit(false, false);
                    }
                });

                $("#scivi_fit_to_screen").click(() => {
                    this.fitScale();
                    this.createCache();
                    this.render(true, true);
                });

                $("#scivi_sort_by_ring").click(() => {
                    this.sortNodesByRingScale(false);
                    this.reinit(false, false);
                });

                $("#scivi_calc_modularity").click(() => {
                    this.m_modularityFilters[0].detectClusters(this.currentData());
                    this.reinit(false, false);
                });

                $("#scivi_sort_by_modularity").click(() => {
                    this.sortNodesNyModularity();
                    this.reinit(false, false);
                });

                $("#scivi_save_graph").click(() => {
                    this.saveGraph();
                });

                $("#scivi_edge_edit").change(() => {
                    this.edgesEditMode = !this.edgesEditMode;
                });

                $("#scivi_create_directed_edges").change(() => {
                    this.createDirectedEdges = !this.createDirectedEdges;
                });                
            }

            this.m_filtersManager.initFilters();

            this.m_stateLineNav.build();

            if (this.m_states.hasStates)
                this.m_stateCalc.build();

            $(document).keyup((e) => {
                if (this.m_prompt.isOpen)
                    return;
                switch (e.keyCode) {
                    case 27: // ESC
                        this.m_draggedNodeIndex = -1;
                        this.dropNode(0.0, 0.0);
                        this.m_draggedRingIndex = -1;
                        this.dropRing(0.0, 0.0);
                        this.m_panning = true; // Prevent selection on mouse up.
                        this.m_mousePressed = false; // Ensure panning is actually blocked by mouse move.
                        if (this.m_cursorPos.x !== undefined && this.m_cursorPos.y !== undefined)
                            this.hoverGraph(this.m_cursorPos.x, this.m_cursorPos.y);
                        this.dropTransientEdge();
                        break;

                    case 46: // DEL
                    case 8:  // BACKSPACE
                        this.deleteSelectedEdge();
                        break;

                    case 72: // H
                        if (this.m_selectedNode) {
                            this.m_selectedNode.isShown = false;
                            this.updateNodesVisibility();
                        }
                        break;

                    case 13: // ENTER
                        if (e.shiftKey) {
                            let needsReinit = false;
                            if (this.m_selectedNode) {
                                if (this.m_multiselectedNodes.length === 1) {
                                    let newEdges = [];
                                    let e1 = new Edge(this.m_selectedNode, this.m_multiselectedNodes[0], 1, null);
                                    this.currentData().edges.push(e1);
                                    newEdges.push(e1);
                                    if (this.createDirectedEdges)
                                        e1.isDirected = true;
                                    else {
                                        let e2 = new Edge(this.m_multiselectedNodes[0], this.m_selectedNode, 1, null);
                                        this.currentData().edges.push(e2);
                                        newEdges.push(e2);
                                    }
                                    this.assignEdgeTooltip(newEdges);
                                    needsReinit = true;
                                } else if (this.m_multiselectedNodes.length > 1) {
                                    let he = new HyperEdge([this.m_selectedNode].concat(this.m_multiselectedNodes.slice()), 1, null);
                                    this.currentData().hyperEdges.push(he);
                                    this.assignEdgeTooltip([ he ]);
                                    needsReinit = true;
                                } else {
                                    this.renameSelectedEdge();
                                }
                            } else {
                                if (this.m_multiselectedNodes.length === 2) {
                                    let newEdges = [];
                                    let e1 = new Edge(this.m_multiselectedNodes[0], this.m_multiselectedNodes[1], 1, null);
                                    this.currentData().edges.push(e1);
                                    newEdges.push(e1);
                                    if (!this.createDirectedEdges) {
                                        let e2 = new Edge(this.m_multiselectedNodes[1], this.m_multiselectedNodes[0], 1, null)
                                        this.currentData().edges.push(e2);
                                        newEdges.push(e2);
                                    }
                                    this.assignEdgeTooltip(newEdges);
                                    needsReinit = true;
                                } else if (this.m_multiselectedNodes.length > 2) {
                                    let he = new HyperEdge(this.m_multiselectedNodes.slice(), 1, null)
                                    this.currentData().hyperEdges.push(he);
                                    this.assignEdgeTooltip([ he ]);
                                    needsReinit = true;
                                } else {
                                    this.renameSelectedEdge();
                                }
                            }

                            if (needsReinit) {
                                this.m_filtersManager.calcWeights();
                                this.reinit(false, false);
                            }
                        }
                        break;
                }
            });

            if (this.m_classifier)
                this.m_classifier.initTreeView(this.m_treeView, this);
        }

        private calcMaxTextLength()
        {
            this.m_maxTextLength = 0;
            let maxTextHeight = 0;
            let n = 0;
            Object.keys(this.m_states.data).forEach((dataKey) => {
                const data = this.m_states.data[dataKey];
                if (data.nodes.length > n)
                    n = data.nodes.length;
            });
            let ww = n < 40;
            Object.keys(this.m_states.data).forEach((dataKey) => {
                const data = this.m_states.data[dataKey];
                data.nodes.forEach((node) => {
                    node.wordWrap = ww;
                    let s = node.labelSize(true);
                    if (s.width > this.m_maxTextLength)
                        this.m_maxTextLength = s.width;
                    if (s.height > maxTextHeight)
                        maxTextHeight = s.height;
                });
            });
            if (this.m_maxTextLength < 50)
                this.m_maxTextLength = 50;

            this.m_maxTextLength += 20;

            this.m_radius = (Math.max(n * maxTextHeight, 1500)) / (2.0 * Math.PI);
            let rsWidth = this.m_scaleLevels ? Renderer.m_ringScaleWidth * this.m_applicableScaleLevelsCount : 0.0;
            this.m_totalRadius = this.m_radius + this.m_maxTextLength + rsWidth;
        }

        private fitScale()
        {
            const aaPadding = 3;
            const radius = Math.min(this.m_view.offsetWidth, this.m_view.offsetHeight - aaPadding) / 2.0;
            let s = radius / this.m_totalRadius;
            if (s > 1.0)
                s = 1.0;
            this.m_stage.scale.set(s, s);
        }

        private createNodes()
        {
            const angleStep = 2.0 * Math.PI / this.currentData().nodes.length;
            const a1 = Math.PI / 2;
            const a2 = 3 * a1;

            this.currentData().nodes.forEach((node: Node, i: number) => {
                let x = this.m_radius * Math.cos(i * angleStep);
                let y = this.m_radius * Math.sin(i * angleStep);

                this.m_stage.addChild(node);

                node.position.set(x, y);
                node.rotation = i * angleStep;

                if (node.rotation > a1 && node.rotation < a2) {
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

            this.currentData().hyperEdges.forEach((hyperEdge) => {
                hyperEdge.nodes.forEach((node) => {
                    node.addHyperEdge(hyperEdge);
                });
                hyperEdge.addToScene(this.m_stage);
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

        private checkRingScaleApplicability()
        {
            this.m_applicableScaleLevelsCount = 0;
            if (this.m_scaleLevels !== null && this.m_scaleLevels.length > 0) {
                this.m_scaleLevels.forEach((scale) => {
                    if (scale.checkApplicability(this.currentData().nodes))
                        ++this.m_applicableScaleLevelsCount;
                });
            }
        }

        private createRingScale()
        {
            if (this.m_applicableScaleLevelsCount === 0) {
                this.m_ringScaleWithSegmentSelected = null;
                this.m_ringScales = [];
                return;
            }

            const angleStep = 2.0 * Math.PI / this.currentData().nodes.length;
            let radius = this.m_radius + this.m_maxTextLength + (this.m_applicableScaleLevelsCount - 0.5) * Renderer.m_ringScaleWidth;

            const selectedRS = this.m_ringScaleWithSegmentSelected;
            this.m_ringScaleWithSegmentSelected = null;

            this.m_ringScales = [];

            for (let i = this.m_scaleLevels.length - 1; i >= 0; --i) {
                let scale = this.m_scaleLevels[i];

                if (!scale.applicable)
                   continue;

                let segment = { from: undefined, id: undefined, nodeID: undefined };

                let rs = new RingScale(this.m_radius, radius, Renderer.m_ringScaleWidth, this.m_ringScaleFontSize, this.m_view);
                this.m_stage.addChild(rs);
                this.m_ringScales.push(rs);

                this.currentData().nodes.forEach((node: Node, i: number) => {
                    let stepID = scale.classifyNode(node);
                    if (stepID !== segment.id) {
                        let a = (i - 0.5) * angleStep;
                        if (segment.id !== undefined) {
                            rs.addSegment(segment.from, a, 
                                          scale.getColor(segment.id),
                                          scale.getTextColor(segment.id),
                                          scale.getName(segment.id),
                                          segment.nodeID.toString() + "|" + node.id.toString());
                        }
                        segment.from = a;
                        segment.id = stepID;
                        segment.nodeID = node.id;
                    }
                });
                if (segment.id !== undefined) {
                    rs.addSegment(segment.from, 2.0 * Math.PI - 0.5 * angleStep,
                                  scale.getColor(segment.id),
                                  scale.getTextColor(segment.id),
                                  scale.getName(segment.id),
                                  segment.nodeID.toString() + "|" + this.currentData().nodes[this.currentData().nodes.length - 1].id.toString());
                }

                if (selectedRS && !this.m_ringScaleWithSegmentSelected) {
                    rs.copySelection(selectedRS);
                    if (rs.segmentSelected)
                        this.m_ringScaleWithSegmentSelected = rs;
                }

                radius -= Renderer.m_ringScaleWidth;
            }
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

            if (this.m_selectedNode !== null) {
                this.m_selectedNode.highlight = HighlightType.Selection;
                this.m_selectedNode.setHighlightForEdgesAndTargetNodes(HighlightType.Hover);
            }
            if (this.m_hoveredNode !== null && this.m_selectedNode !== this.m_hoveredNode) {
                this.m_hoveredNode.highlight = HighlightType.Hover;
                this.m_hoveredNode.setHighlightForEdgesAndTargetNodes(HighlightType.Hover);
            }
            this.m_multiselectedNodes.forEach((node) => {
                if (node.visible && node !== this.m_selectedNode) {
                    node.highlight = HighlightType.Multiselect;
                    node.setHighlightForEdgesAndTargetNodes(HighlightType.Hover);
                }
            });

            this.currentData().nodes.forEach((node) => {
                if (node.visible) {
                    if (node !== this.m_selectedNode && node !== this.m_hoveredNode && !node.multiselected) {
                        node.setHighlightForEdges(HighlightType.None);
                        if (this.m_highlightedGroup !== undefined && node.groupID === this.m_highlightedGroup)
                            node.highlight = HighlightType.Hover;
                    }
                    let nr = node.prepare();
                    needsRender = needsRender || nr;
                }
            });

            let es = this.m_edgeSelector.prepare();
            needsRender = needsRender || es;

            this.m_edgeBatches.forEach((batch) => {
                let nr = batch.prepare();
                needsRender = needsRender || nr;
            });

            if (this.m_transientEdgeBatch) {
                let nr = this.m_transientEdgeBatch.prepare();
                needsRender = needsRender || nr;
            }

            this.currentData().hyperEdges.forEach((hyperEdge) => {
                let nr = hyperEdge.prepare();
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
            this.m_stateLineNav.updateStateLineLabels();
            this.render(true, true);
        }

        public changeActiveGroupColor(newColor: string)
        {
            if (this.m_selectedNode) {
                let focusGroup = this.m_selectedNode.groupID;
                this.m_stage.colors[focusGroup] = string2color(newColor);
                this.reinit(false, false);
            }
        }

        public changeGroupColor(focusGroup: number, newColor: string)
        {
            this.m_stage.colors[focusGroup] = string2color(newColor);
            this.reinit(false, false);
        }

        public quasiZoomIn(groupID: number)
        {
            let newStates = new GraphStates();

            Object.keys(this.m_states.data).forEach((dataKey) => {
                const data = this.m_states.data[dataKey];
                let newNodes = [];
                data.nodes.forEach((node) => {
                    if (node.groupID === groupID)
                        newNodes.push(node);
                });

                let newEdges = [];
                data.edges.forEach((edge) => {
                    if (edge.source.groupID === groupID  && edge.target.groupID === groupID)
                        newEdges.push(edge);
                });

                newStates.data[dataKey] = new GraphData(newNodes, newEdges, []);
            });

            if (this.m_statesStack === null)
                this.m_statesStack = [];
            this.m_statesStack.push(this.m_states);
            this.m_states = newStates;

            this.reinit(true, false);
        }

        public quasiZoomOut()
        {
            this.m_states = this.m_statesStack.pop();

            this.reinit(true, false);
        }

        public canQuasiZoomIn(): boolean
        {
            return this.m_statesStack === null || this.m_statesStack.length === 0;
        }

        public canQuasiZoomOut(): boolean
        {
            return this.m_statesStack !== null && this.m_statesStack.length > 0;
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

        private isEdgeVisibleByRingSegment(edge: Edge): boolean
        {
            if (this.m_ringScaleWithSegmentSelected) {
                if (this.m_ringSegmentFilterBothEnds) {
                    for (let i = 0, n = this.m_ringScales.length; i < n; ++i) {
                        if (this.m_ringScales[i].nodeInSelectedSegment(edge.source) &&
                            this.m_ringScales[i].nodeInSelectedSegment(edge.target))
                            return true;
                    }
                } else {
                    for (let i = 0, n = this.m_ringScales.length; i < n; ++i) {
                        if (this.m_ringScales[i].nodeInSelectedSegment(edge.source) ||
                            this.m_ringScales[i].nodeInSelectedSegment(edge.target))
                            return true;
                    }
                }
                return false;
            }
            return true;
        }

        private isEdgeVisibleByEqualizer(edge: Edge): boolean
        {
            for (let i = 0, n = this.m_filtersManager.equalizer.length; i < n; ++i) {
                if (this.m_filtersManager.equalizer[i].hidesEdge(edge))
                    return false;
            }
            return true;
        }

        private isNodeVisibleByEqualizer(node: Node): boolean
        {
            for (let i = 0, n = this.m_filtersManager.equalizer.length; i < n; ++i) {
                if (this.m_filtersManager.equalizer[i].hidesNode(node))
                    return false;
            }
            return true;
        }

        private filterEdges(): boolean
        {
            let result = false;
            let needsRepostInfo = false;
            let cnt = 0;
            let w = 0;
            let hCnt = 0;
            let hW = 0;
            const rmin = this.m_filtersManager.edgeWeight.min;
            const rmax = this.m_filtersManager.edgeWeight.max;
            this.currentData().edges.forEach((edge) => {
                const rv = edge.weight;
                const vis = edge.source.visible && edge.target.visible && rv >= rmin && rv <= rmax &&
                            this.isEdgeVisibleByRingSegment(edge) && this.isEdgeVisibleByEqualizer(edge);
                if (vis !== edge.visible) {
                    edge.visible = vis;
                    result = true;
                    if (edge.source === this.m_selectedNode || edge.target === this.m_selectedNode)
                        needsRepostInfo = true;
                }
                if (edge.visible) {
                    edge.setNeedsUpdate(); // Thickness may have changed due to filtering => update needed.
                    ++cnt;
                    w += edge.weight;
                }
            });
            this.currentData().hyperEdges.forEach((hyperEdge) => {
                const rv = hyperEdge.weight;
                const vis = rv >= rmin && rv <= rmax;
                if (vis !== hyperEdge.visible) {
                    hyperEdge.visible = vis;
                    result = true;
                    if (hyperEdge.nodes.indexOf(this.m_selectedNode) >= 0)
                        needsRepostInfo = true;
                }
                if (hyperEdge.visible) {
                    hyperEdge.setNeedsUpdate(); // Thickness may have changed due to filtering => update needed.
                    ++hCnt;
                    hW += hyperEdge.weight;
                }
            });
            if (needsRepostInfo)
                this.m_selectedNode.postInfo();
            if (this.m_statistics)
                this.m_statistics.updateEdgesStat(cnt, w, hCnt, hW);
            return result;
        }

        private filterNodes(): boolean
        {
            let result = false;
            let cnt = 0;
            let w = 0;
            const rmin = this.m_filtersManager.nodeWeight.min;
            const rmax = this.m_filtersManager.nodeWeight.max;
            this.currentData().nodes.forEach((node) => {
                const rv = node.weight;
                const vis = node.isShown && rv >= rmin && rv <= rmax &&
                            this.isNodeVisibleByEqualizer(node);
                if (vis !== node.visible) {
                    node.visible = vis;
                    node.hyperEdges.forEach((hyperEdge) => {
                        hyperEdge.setNeedsUpdate();
                    });
                    result = true;
                    if (node === this.m_selectedNode)
                        this.m_clicked = true;
                }
                if (node.visible) {
                    ++cnt;
                    w += node.weight;
                }
            });
            if (this.m_statistics) {
                this.m_statistics.buildChart(this.currentData().nodes, this.m_stage.colors);
                this.m_statistics.updateNodesStat(cnt, w);
            }
            return result;
        }

        public changeNodeAlpha(value: number)
        {
            $("#scivi_node_alpha").text(value);
            Node.passiveTextAlpha = value;
            this.currentData().nodes.forEach((node) => {
                node.invalidate(false);
            });
            this.render(true, true);
        }

        public changeEdgeAlpha(value: number)
        {
            $("#scivi_edge_alpha").text(value);
            Edge.passiveEdgeAlpha = value;
            this.currentData().nodes.forEach((node) => {
                node.invalidate(false);
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
            if (this.m_scaleLevels) {
                this.m_scaleLevels.forEach((sl: Scale, i: number) => {
                    sl.id = i;
                });
            }
        }

        get ringScales(): RingScale[]
        {
            return this.m_ringScales;
        }

        public reorderScaleLevels(order: number[])
        {
            let s = [];
            order.forEach((i) => {
                s.push(this.scaleLevels[i]);
            });
            this.m_scaleLevels = s;
            this.sortNodesByRingScale(true);
        }

        get classifier(): Classifier
        {
            return this.m_classifier;
        }

        set classifier(c: Classifier)
        {
            this.m_classifier = c;
        }

        private smartCmp(x1: string, x2: string): number
        {
            const x1num = /^\d+(\.\d+)?$/.test(x1);
            const x2num = /^\d+(\.\d+)?$/.test(x2);
            if (x1num && x2num) {
                const x1f = parseFloat(x1);
                const x2f = parseFloat(x2);
                if (x1f < x2f)
                    return -1;
                else if (x1f > x2f)
                    return 1;
                else
                    return 0;
            } else {
                if (x1 < x2)
                    return -1;
                else if (x1 == x2)
                    return 0;
                else
                    return 1;
            }
        }

        public sortNodesByRingScale(sortAllStates: boolean)
        {
            if (this.m_scaleLevels.length > 0) {
                const sorter = (x1, x2) => {
                    for (let i = this.m_scaleLevels.length - 1; i >= 0; --i) {
                        const v1 = this.m_scaleLevels[i].getStepID(x1);
                        const v2 = this.m_scaleLevels[i].getStepID(x2);
                        if (v1 < v2)
                            return -1;
                        else if (v1 > v2)
                            return 1;
                    }
                    const v1 = this.m_scaleLevels[0].getValue(x1);
                    const v2 = this.m_scaleLevels[0].getValue(x2);
                    if (v1 < v2)
                        return -1;
                    else if (v1 > v2)
                        return 1;
                    else
                        return this.smartCmp(x1.label, x2.label);
                }
                if (sortAllStates) {
                    Object.keys(this.m_states.data).forEach((dataKey) => {
                        const data = this.m_states.data[dataKey];
                        data.nodes.sort(sorter);
                    });
                } else {
                    this.currentData().nodes.sort(sorter);
                }
            }
        }

        public sortNodesNyModularity()
        {
            const sorter = (x1, x2) => {
                const v1 = x1.groupID;
                const v2 = x2.groupID;
                if (v1 < v2)
                    return -1;
                else if (v1 > v2)
                    return 1;
                else
                    return this.smartCmp(x1.label, x2.label);
            }
            this.currentData().nodes.sort(sorter);
        }

        public hoverNode(node: Node)
        {
            this.m_hoveredNode = node;
            this.render(false, true);
        }

        public selectNode(node: Node)
        {
            if (node === null || node === this.m_selectedNode)
                this.clearSelected();
            else {
                this.setSelectedNode(node);
                this.m_selectedNode.postInfo();
            }
            this.render(false, true);
        }

        public multiselectNode(node: Node)
        {
            if (node === null)
                this.clearSelected();
            else {
                if (!this.removeFromMultiselection(node))
                    this.addToMultiselection(node);
            }
            this.render(false, true);
        }

        public addToMultiselection(node)
        {
            if (!node.multiselected) {
                node.multiselected = true;
                this.m_multiselectedNodes.push(node);
            }
        }

        public removeFromMultiselection(node): boolean
        {
            if (node.multiselected)
            {
                for (let i = 0, n = this.m_multiselectedNodes.length; i < n; ++i) {
                    if (this.m_multiselectedNodes[i] === node) {
                        node.multiselected = false;
                        this.m_multiselectedNodes.splice(i, 1);
                        return true;
                    }
                }
            }
            return false;
        }

        private selectRingSegment()
        {
            let f1 = false;
            this.m_ringScaleWithSegmentSelected = null;
            if (this.m_ringScales) {
                this.m_ringScales.forEach((rs) => {
                    const rsf = rs.handleSelection();
                    f1 = f1 || rsf;
                    if (rs.segmentSelected)
                        this.m_ringScaleWithSegmentSelected = rs;
                });
            }
            const f2 = this.filterEdges();
            this.render(f1 || f2, true);
        }

        private paintNodesByRingSegment()
        {
            let activeRS = null;
            let needsUpdate = false;
            if (this.m_ringScales) {
                for (let i = 0, n = this.m_ringScales.length; i < n; ++i) {
                    activeRS = this.m_ringScales[i].contextSegment;
                    if (activeRS)
                        break;
                }
            }
            if (activeRS) {
                this.currentData().nodes.forEach((node) => {
                    if (activeRS.containsAngle(node.rotation)) {
                        node.customColor = activeRS.color;
                        needsUpdate = true;
                    }
                });
            }
            if (needsUpdate) {
                this.currentData().nodes.forEach((node) => {
                    node.invalidate(false);
                });
                this.render(true, true);
            }
        }

        private addEqualizerItem()
        {
            if (this.m_ringScales) {
                for (let i = 0, n = this.m_ringScales.length; i < n; ++i) {
                    const segm = this.m_ringScales[i].contextSegment;
                    if (segm) {
                        let needsCreate = true;
                        for (let j = 0, m = this.m_filtersManager.equalizer.length; j < m; ++j) {
                            if (this.m_filtersManager.equalizer[j].matches(segm)) {
                                needsCreate = false;
                                break;
                            }
                        }
                        if (needsCreate)
                            this.m_filtersManager.equalizer.push(new EqualizerItem(this, segm, i));
                        break;
                    }
                }
            }
        }

        public removeEqualizerItem(item: EqualizerItem)
        {
            const idx = this.m_filtersManager.equalizer.indexOf(item);
            if (idx > -1) {
                this.m_filtersManager.equalizer.splice(idx, 1);
                this.updateNodesVisibility();
            }
        }

        public updateNodesVisibility()
        {
            let r1 = this.filterNodes();
            let r2 = this.filterEdges();
            if (r1 || r2)
                this.render(true, true);
            this.m_filtersManager.validateCurrentFilterSet();
        }

        public updateEdgesVisibility()
        {
            if (this.filterEdges())
                this.render(true, true);
            this.m_filtersManager.validateCurrentFilterSet();
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
            this.reinit(false, false);
        }

        public updateNodeKlasses()
        {
            this.m_filtersManager.calcWeights();
            this.reinit(false, true);
        }

        get radius(): number
        {
            return this.m_radius;
        }

        get localizer(): {}
        {
            return this.m_localizer;
        }

        public changeCurrentState(cs: string)
        {
            if (this.m_states.isDynamic) {
                this.m_states.data["current"] = null;
                this.m_currentStateKey = cs;
                this.currentData(); // Force state to load
                this.m_filtersManager.calcWeights();
                this.m_stage.nodeWeight = this.m_filtersManager.nodeWeight;
                this.m_stage.edgeWeight = this.m_filtersManager.edgeWeight;
                this.m_filtersManager.initFilters();
            } else {
                this.m_currentStateKey = cs;
            }
            this.reinit(false, false);
        }

        public changeCurrentStateToCalculated()
        {
            this.m_currentStateKey = "calculated";
            this.m_filtersManager.calcWeights();
            this.m_stage.nodeWeight = this.m_filtersManager.nodeWeight;
            this.m_stage.edgeWeight = this.m_filtersManager.edgeWeight;
            this.m_filtersManager.initFilters();
            this.sortNodesByRingScale(false);
            this.m_stateLineNav.curtain();
            this.reinit(false, false);
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
            let f1 = this.m_edgeSelector.handleCursorMove(lx, ly, s, x, y);
            let f2 = false;
            let m = false;
            if (this.m_ringScales) {
                this.m_ringScales.forEach((rs) => {
                    const rsf = rs.handleCursorMove(lx, ly, s, x, y);
                    m = m || (rs.highlightedSegment !== null);
                    f2 = f2 || rsf;
                });
            }
            this.contextMenuEnabled = m;
            this.render(f1 || f2, true);
        }

        private createTransientEdgeWithSourceNode(node: Node)
        {
            this.m_transientEdgeBatch = new EdgeBatch();
            this.m_transientEdge = new Edge(node, node, 1, null);
            this.m_transientEdgeBatch.addEdge(this.m_transientEdge);
            this.m_transientEdge.highlight = HighlightType.Hover;
            this.m_transientEdge.isDirected = this.m_createDirectedEdges;
            this.m_stage.addChild(this.m_transientEdgeBatch);
            this.render(true, true);
        }

        private changeTransientEdge()
        {
            if (this.m_transientEdgeBatch) {
                const lx = this.m_cursorPos.x - this.m_renderingCache.x;
                const ly = this.m_cursorPos.y - this.m_renderingCache.y;
                const s = this.m_renderingCache.currentScale();
                const node = this.getNodeByPosition(lx, ly, s);
                this.m_transientEdge.assignTarget(node);
                this.m_transientEdge.setCursorPos({ x: lx / s, y: ly / s }, this.m_radius);
                this.m_transientEdge.invalidate(false);
                this.m_transientEdge.highlight = HighlightType.Hover;
                this.render(true, true);
            }
        }

        private commitTransientEdge()
        {
            if (this.m_transientEdgeBatch) {
                const needsReinit = this.m_transientEdge.target !== null;
                if (needsReinit) {
                    let newEdges = [];
                    this.currentData().edges.push(this.m_transientEdge);
                    newEdges.push(this.m_transientEdge);
                    if (!this.createDirectedEdges && this.m_transientEdge.source !== this.m_transientEdge.target) {
                        let e2 = new Edge(this.m_transientEdge.target, this.m_transientEdge.source, 1, null)
                        this.currentData().edges.push(e2);
                        newEdges.push(e2);
                    }
                    this.assignEdgeTooltip(newEdges);
                }
                this.m_stage.removeChild(this.m_transientEdgeBatch);
                this.m_transientEdge = null;
                this.m_transientEdgeBatch = null;
                if (needsReinit) {
                    this.m_filtersManager.calcWeights();
                    this.reinit(false, false);
                } else {
                    this.render(true, true);
                }
            }
        }

        private dropTransientEdge()
        {
            if (this.m_transientEdgeBatch) {
                this.m_stage.removeChild(this.m_transientEdgeBatch);
                this.m_transientEdge = null;
                this.m_transientEdgeBatch = null;
                this.render(true, true);
            }
        }

        private assignEdgeTooltip(edges: any[])
        {
            this.m_prompt.show(this.m_localizer["LOC_ENTER_EDGE_TOOLTIP"],
                               (val: string) => {
                                    if (val)
                                        edges.forEach((edge) => { edge.tooltip = val; })
                                    this.m_edgeSelector.updateEdgeTooltip();
                               });
        }

        private selectEdge()
        {
            if (this.m_edgeSelector.handleClick())
                this.render(true, true);
            else if (this.m_selectedNode)
                this.selectNode(null);
        }

        private deleteSelectedEdge()
        {
            if (this.m_edgeSelector.selectedEdge) {
                const d = this.currentData();
                const n = d.edges.length;
                let i = 0;
                for (; i < n; ++i) {
                    if (d.edges[i] === this.m_edgeSelector.selectedEdge)
                        break;
                }
                if (i < n) {
                    d.edges.splice(i, 1);
                    this.m_edgeSelector.deleteSelectedEdge();
                    this.reinit(false, false);
                    if (this.m_cursorPos.x !== undefined && this.m_cursorPos.y !== undefined)
                        this.hoverGraph(this.m_cursorPos.x, this.m_cursorPos.y);
                }
            }
            if (this.m_edgeSelector.selectedHyperEdge) {
                const d = this.currentData();
                const n = d.hyperEdges.length;
                let i = 0;
                for (; i < n; ++i) {
                    if (d.hyperEdges[i] === this.m_edgeSelector.selectedHyperEdge)
                        break;
                }
                if (i < n) {
                    d.hyperEdges.splice(i, 1);
                    this.m_edgeSelector.deleteSelectedHyperEdge();
                    this.reinit(false, false);
                    if (this.m_cursorPos.x !== undefined && this.m_cursorPos.y !== undefined)
                        this.hoverGraph(this.m_cursorPos.x, this.m_cursorPos.y);
                }
            }
        }

        private renameSelectedEdge()
        {
            let edges = [];
            if (this.m_edgeSelector.selectedEdge)
                edges.push(this.m_edgeSelector.selectedEdge);
            if (this.m_edgeSelector.selectedHyperEdge)
                edges.push(this.m_edgeSelector.selectedHyperEdge);
            if (edges.length > 0)
                this.assignEdgeTooltip(edges);
        }

        private startDragNode(x: number, y: number): boolean
        {
            const lx = x - this.m_renderingCache.x;
            const ly = y - this.m_renderingCache.y;
            const s = this.m_renderingCache.currentScale();
            if (this.m_edgesEditMode) {
                this.m_transientEdgeSource = this.getNodeByPosition(lx, ly, s);
                return this.m_transientEdgeSource !== null;
            } else {
                this.m_draggedNodeIndex = this.getNodeIndexByPosition(lx, ly, s);
                if (this.m_draggedNodeIndex >= 0) {
                    if (this.m_nodeBorder === null) {
                        this.m_nodeBorder = new NodeBorder();
                        this.m_stage.addChild(this.m_nodeBorder);
                    }
                    this.m_nodeBorder.showForNode(this.currentData().nodes[this.m_draggedNodeIndex]);
                    this.render(true, true);
                    return true;
                }
            }
            return false;
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
            let needsReinit = false;
            if (this.m_draggedNodeIndex !== -1 && this.m_nodePlaceHolder && this.m_nodePlaceHolder.visible) {
                const n = this.currentData().nodes.length;
                const lx = x - this.m_renderingCache.x;
                const ly = y - this.m_renderingCache.y;
                let idx = this.getAngularIndex(lx, ly);
                if (idx > this.m_draggedNodeIndex)
                    --idx;
                else if (idx == 0 && this.m_draggedNodeIndex > n / 2)
                    idx = n - 1;
                if (idx !== this.m_draggedNodeIndex) {
                    const dNode = this.currentData().nodes[this.m_draggedNodeIndex];
                    this.currentData().nodes.splice(this.m_draggedNodeIndex, 1);
                    this.currentData().nodes.splice(idx, 0, dNode);
                    needsReinit = true;
                }
                result = true;
            }
            this.stopDragNode();
            if (needsReinit)
                this.reinit(false, false);
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
            if (this.m_nodeBorder)
                this.m_nodeBorder.showForNode(null);
        }

        private startDragRing(x: number, y: number): boolean
        {
            const lx = x - this.m_renderingCache.x;
            const ly = y - this.m_renderingCache.y;
            const s = this.m_renderingCache.currentScale();
            this.m_draggedRingIndex = this.getRingIndexByPosition(lx, ly, s);
            if (this.m_draggedRingIndex >= 0) {
                if (this.m_ringBorder === null) {
                    this.m_ringBorder = new RingBorder();
                    this.m_stage.addChild(this.m_ringBorder);
                }
                const draggingRing = this.m_ringScales[this.m_draggedRingIndex];
                this.m_ringBorder.showForRing(draggingRing);
                this.render(true, true);
                return true;
            }
            return false;
        }

        private dragRing(x: number, y: number)
        {
            if (!this.m_ringPlaceHolder) {
                this.m_ringPlaceHolder = new RingPlaceHolder();
                this.m_stage.addChild(this.m_ringPlaceHolder);
            }
            let r = [ 0.0 ];
            const lx = x - this.m_renderingCache.x;
            const ly = y - this.m_renderingCache.y;
            const s = this.m_renderingCache.currentScale();
            const idx = this.getRingIndexByPosition(lx, ly, s, r);
            if (this.m_ringPlaceHolder.showForRing(r[0])) {
                this.m_ringScales[this.m_draggedRingIndex].dropHighlight();
                this.render(true, true);
            }
        }

        private dropRing(x: number, y: number): boolean
        {
            let result = false;
            let needsReinit = false;
            if (this.m_draggedRingIndex !== -1 && this.m_ringPlaceHolder && this.m_ringPlaceHolder.visible) {
                let r = [ 0.0 ];
                const lx = x - this.m_renderingCache.x;
                const ly = y - this.m_renderingCache.y;
                const s = this.m_renderingCache.currentScale();
                let idx = this.getRingIndexByPosition(lx, ly, s, r);
                if (this.m_draggedRingIndex - idx > 0 || this.m_draggedRingIndex - idx < -1) {
                    if (idx > this.m_draggedRingIndex)
                        --idx;
                    if (idx < 0)
                        idx = 0;
                    else if (idx === this.m_scaleLevels.length)
                        idx = this.m_scaleLevels.length - 1;
                    const i1 = this.m_scaleLevels.length - this.m_draggedRingIndex - 1;
                    const i2 = this.m_scaleLevels.length - idx - 1;
                    const dScaleLevel = this.m_scaleLevels[i1];
                    this.m_scaleLevels.splice(i1, 1);
                    this.m_scaleLevels.splice(i2, 0, dScaleLevel);
                    needsReinit = true;
                }
                result = true;
            }
            this.stopDragRing();
            if (needsReinit)
                this.reinit(false, false);
            else
                this.render(true, true);
            this.hoverGraph(x, y);
            return result;
        }

        private stopDragRing()
        {
            if (this.m_ringPlaceHolder)
                this.m_ringPlaceHolder.showForRing(-1);
            this.m_draggedRingIndex = -1;
            if (this.m_ringBorder)
                this.m_ringBorder.showForRing(null);
        }

        set contextMenuEnabled(enabled: boolean)
        {
            $("#" + this.m_view.id).contextMenu(enabled);
        }

        public downloadFile(filename: string, content: string)
        {
            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

        get maxNumberOfNodes(): number
        {
            return this.m_filtersManager.maxNumberOfNodes;
        }

        get maxNumberOfEdges(): number
        {
            return this.m_filtersManager.maxNumberOfEdges;
        }

        private saveAsSemanticMapCSV()
        {
            // Save current state of graph to Semograph-compatible semantic map in csv
            var filename = prompt("Enter name of file to save", "graph.csv");
            if (!filename)
                return;
            if (filename.indexOf(".") === -1)
                filename += ".csv";
            let n = 0;
            let nodeIndices = {};
            this.currentData().nodes.forEach((node) => {
                if (node.visible) {
                    nodeIndices[node.positionHash()] = n;
                    ++n;
                }
            });
            let sMap = [];
            for (let i = 0, m = n + 1; i < m; ++i) {
                let line = [];
                for (let j = 0, k = n + 2; j < k; ++j)
                    line.push("");
                sMap.push(line);
            }
            let index = 0;
            this.currentData().nodes.forEach((node) => {
                if (node.visible) {
                    const index = nodeIndices[node.positionHash()] + 1;
                    sMap[0][index] = "\"" + node.label + "\"";
                    sMap[index][0] = "\"" + node.label + "\"";
                    sMap[index][n + 1] = node.weight;
                }
            });
            sMap[0][n + 1] = "Weight";
            this.currentData().edges.forEach((edge) => {
                if (edge.visible && edge.source.visible && edge.target.visible) {
                    sMap[nodeIndices[edge.source.positionHash()] + 1][nodeIndices[edge.target.positionHash()] + 1] = edge.weight;
                }
            });
            let csv = "";
            sMap.forEach((line) => {
                csv += line.join(",") + "\n";
            });
            this.downloadFile(filename, csv);
        }

        public saveAsJSON(): string
        {
            let nodesArray = "[\n";
            let nodes = this.currentData().nodes;
            for (let i = 0, n = nodes.length; i < n; ++i) {
                nodesArray += "  { \"id\": " + nodes[i].id +
                              ", \"label\": \"" + nodes[i].label +
                              "\", \"weight\": " + nodes[i].weight +
                              " }"
                if (i < n - 1)
                    nodesArray += ",";
                nodesArray += "\n";
            }
            nodesArray += "],\n";

            let edgesArray = "[\n";
            let edges = this.currentData().edges;
            for (let i = 0, n = edges.length; i < n; ++i) {
                edgesArray += "  { \"source\": " + edges[i].source.id +
                              ", \"target\": " + edges[i].target.id +
                              ", \"weight\": " + edges[i].weight +
                              (edges[i].tooltip !== undefined ? ", \"tooltip\": \"" + edges[i].tooltip + "\"" : "") +
                              " }";
                if (i < n - 1)
                    edgesArray += ",";
                edgesArray += "\n";
            }
            edgesArray += "],\n";

            let hyperEdgesArray = "[\n";
            let hyperEdges = this.currentData().hyperEdges;
            for (let i = 0, n = hyperEdges.length; i < n; ++i) {
                let hyperLinkedNodesArray = "";
                for (let j = 0, m = hyperEdges[i].nodes.length; j < m; ++j) {
                    hyperLinkedNodesArray += hyperEdges[i].nodes[j].id;
                    if (j < m - 1)
                        hyperLinkedNodesArray += ", ";
                }
                hyperEdgesArray += "  { \"nodes\": [ " + hyperLinkedNodesArray +
                                   " ], \"weight\": " + hyperEdges[i].weight +
                                   (hyperEdges[i].tooltip !== undefined ? ", \"tooltip\": \"" + hyperEdges[i].tooltip + "\"" : "") +
                                   " }";
                if (i < n - 1)
                    hyperEdgesArray += ",";
                hyperEdgesArray += "\n";
            }
            hyperEdgesArray += "]\n";

            return "{\n\"label\": \"" + this.currentStateKey +
                   "\",\n\"nodes\": " + nodesArray +
                   "\"edges\": " + edgesArray +
                   "\"hyperEdges\": " + hyperEdgesArray + "}\n";
        }

        public saveGraph()
        {
            /*
            // Save graph to js script
            // FIXME: Convert dataKey to label
            let g = "{\n  states: [\n";
            let firstState = true;
            Object.keys(this.m_states.data).forEach((dataKey) => {
                if (!firstState)
                    g += ",\n";
                g += "    {\n      label: \"" + this.m_states.stateLines[0][dataKey] + "\",\n      nodes: [\n";
                const data = this.m_states.data[dataKey];
                let first = true;
                for (let i = 0, n = data.nodes.length; i < n; ++i) {
                    if (data.nodes[i].visible) {
                        if (!first)
                            g += ",\n";
                        g += "        " + JSON.stringify(data.nodes[i].custom);
                        first = false;
                    }
                }
                g += "      ],\n      edges: [\n";
                first = true;
                for (let i = 0, n = data.edges.length; i < n; ++i) {
                    if (data.edges[i].visible) {
                        if (!first)
                            g += ",\n";
                        g += "        { \"source\": " + data.edges[i].source.id + 
                             ", \"target\": " + data.edges[i].target.id + 
                             ", \"weight\": " + data.edges[i].weight +
                             ", \"tooltip\": " + data.edges[i].tooltip + " }";
                        first = false;
                    }
                }
                g += "      ]\n    }";
                firstState = false;
            });
            g += "  ]\n}";
            this.downloadFile("graph.js", g);
            */
            var filename = prompt("Enter name of file to save", "graph.json");
            if (!filename)
                return;
            if (filename.indexOf(".") === -1)
                filename += ".json";
            this.downloadFile(filename, this.saveAsJSON());
        }

        public selectGraphState(stateName: string)
        {
            this.m_stateLineNav.selectState(stateName);
        }

        public loadFilterSet(filterSet: FilterSettings[])
        {
            this.m_filtersManager.loadFilterSet(filterSet);
        }

        get edgesEditMode(): boolean
        {
            return this.m_edgesEditMode;
        }

        set edgesEditMode(eem: boolean)
        {
            this.m_edgesEditMode = eem;
            $("#scivi_edge_edit").prop("checked", eem);
        }

        get createDirectedEdges(): boolean
        {
            return this.m_createDirectedEdges;
        }

        set createDirectedEdges(cde: boolean)
        {
            this.m_createDirectedEdges = cde;
            $("#scivi_create_directed_edges").prop("checked", cde);
        }

        private setSelectedNode(sn: Node)
        {
            this.m_selectedNode = sn;
            if (this.m_states) {
                if (sn) {
                    this.m_edgeSelector.edges = sn.edges;
                    this.m_edgeSelector.hyperEdges = sn.hyperEdges;
                    this.m_edgeSelector.orphanedMode = false;
                } else {
                    this.m_edgeSelector.edges = this.currentData().edges;
                    this.m_edgeSelector.hyperEdges = this.currentData().hyperEdges;
                    this.m_edgeSelector.orphanedMode = true;
                }
            }
        }
    }
}
