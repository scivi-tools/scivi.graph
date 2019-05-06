import * as d3 from 'd3';
import * as L from 'leaflet';
import Split from 'split.js';
import { GraphController } from './Core/GraphController';
import { Sidebar } from './Sidebar';

import 'leaflet/dist/leaflet.css';
import '../styles/renderer.css';

// TODO: completely rewrite this shit
// split into separate modules, at least:
// - map backend
// - view rules
export class Renderer {
    private _controller: GraphController | null = null;
    private _map: L.Map | null = null;
    private _svg: d3.Selection<d3.BaseType, object, any, any> | null = null;
    private _g: d3.Selection<SVGGElement, object, any, any> | null = null;
    private _sidebar: Sidebar;

    constructor(
        private readonly _rootElement: HTMLElement
    ) {
        this.buildUI();

        this._sidebar = new Sidebar(document.getElementById('scivi_gisgraph_b')!);
    }

    private buildUI(): Renderer {
        this._rootElement.innerHTML = `
            <div id="scivi_gisgraph_a" class="split split-horizontal">
                <div id="scivi_map_root"></div>
            </div>
            <div id="scivi_gisgraph_b" class="split split-horizontal"></div>
        `;

        return this;
    }

    init(): Renderer {
        Split(['#scivi_gisgraph_a', '#scivi_gisgraph_b'], {
            gutterSize: 5,
            sizes: [70, 30],
            minSize: 50
        });

        // TODO: check if browser supports svg and fail if not
        this._map = L.map('scivi_map_root').setView([20, 0], 1.5);
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: `&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors`,
            maxZoom: 18,
            noWrap: true
        }).addTo(this._map);
        L.svg().addTo(this._map);
        
        this._svg = d3.select(this._map.getPanes().overlayPane).select('svg').attr("pointer-events", "auto");;
        this._g = this._svg.select('g');

        return this;
    }

    run(): Renderer {
        // TODO: center graph on bounding box?
        const self = this;
        if (!!this._controller && !!this._g) {
            const nodeSizeRange = [7, 40];
            const desiredMaxWeight = 30000;
            const weightThreshold = (weight: number) => {
                const m = Math.min(weight / desiredMaxWeight, 1);
                return m * (nodeSizeRange[1] - nodeSizeRange[0]) + nodeSizeRange[0];
            };

            const nodeContainers = this._g
                .selectAll('g .nodes')
                .data(this._controller.currentState.nodes)
                .enter()
                .append('g')
                .classed('nodes', true);
            // circles
            nodeContainers
                .append('circle')
                .style("stroke", "black")  
                .style("opacity", .6) 
                .style("fill", "red")
                .attr("r", node => weightThreshold(node.weight))
                .on('click', function (node) {
                    const event = (d3.event as MouseEvent);
                    self._sidebar.node = node;
                    event.stopPropagation();
                });
            // text labels
            const labelContainers = nodeContainers.append('g');
            const textBBoxes = labelContainers.append('rect');
            const labels = labelContainers
                .append('text')
                .text(node => node.name);
            textBBoxes
                .call(selector => {
                    const labelNodes = labels.nodes();
                    selector.each(function (node, i) {
                        const rect = labelNodes[i].getBoundingClientRect();
                        
                        this.setAttribute('height', rect.height.toString());
                        // TODO: WUT a constant?
                        this.setAttribute('width', `${rect.width + 2.5}`);
                        this.setAttribute('y', `${-rect.height + 2.5}`);
                        this.setAttribute('x', '-2.5');
                        this.setAttribute('rx', '2.5');
                        this.setAttribute('ry', '2.5');
                    });
                })
                .attr('fill', '#EEEEEE')
                .style('stroke', 'black')
                .style('opacity', 0.9)
                ;
            
            labelContainers
                .attr('transform', function (node) {
                    return `translate(${-this.getBoundingClientRect().width / 2}, ${10 + weightThreshold(node.weight)})`;
                });
            
            
            this._svg!.on('click', () => {
                this._sidebar.reset();
            });

            const map = (this._map as L.Map);
            const updateCallback = () => {
                nodeContainers.attr('transform', node => {
                    const translatedCoords = map.latLngToLayerPoint([node.location.x, node.location.y]);
                    return `translate(${translatedCoords.x}, ${translatedCoords.y})`;
                });
            }
            map.on('viewreset', updateCallback);
            map.on('zoomend', updateCallback);
            updateCallback();
        }

        return this;
    }

    set graphController(controller: GraphController | null) {
        if (!!this._controller) {
            throw new Error('Can not change graph controller on the fly!');
        }
        this._controller = controller;
    }
}