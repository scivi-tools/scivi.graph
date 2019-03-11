import { GraphController } from "./Core/GraphController";
import * as L from "leaflet";

import 'leaflet/dist/leaflet.css'
import * as d3 from "d3";
import { svg } from "d3";

export class Renderer {
    private _controller: GraphController | null = null;
    private _map: L.Map | null = null;
    private _svg: d3.Selection<d3.BaseType, object, any, any> | null = null;
    private _g: d3.Selection<SVGGElement, object, any, any> | null = null;

    constructor(
        private readonly _rootElement: HTMLElement
    ) {
        this.buildUI();
    }

    private buildUI(): Renderer {
        this._rootElement.innerHTML = `
            <div id="scivi_map_root" style="height: 100%; width: 100%"></div>
        `;

        return this;
    }

    init(): Renderer {
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
        // TODO: center graph on bounding box
        if (!!this._controller && !!this._g) {
            const nodeSizeRange = [5, 40];
            const desiredMaxWeight = 30000;
            const features = this._g.selectAll('circle')
                .data(this._controller.currentState.nodes)
                .enter().append("circle")
                .style("stroke", "black")  
                .style("opacity", .6) 
                .style("fill", "red")
                .attr("r", d => {
                    const m = Math.min(d.weight / desiredMaxWeight, 1);
                    return m * (nodeSizeRange[1] - nodeSizeRange[0]) + nodeSizeRange[0];
                })
                .on('click', (e, x, z) => {
                    console.log('Node clicked:', e, x, z);
                    (d3.event as Event).stopPropagation();
                });
            
            // L.DomEvent.disableClickPropagation(this._svg!.node() as HTMLElement);
            this._svg!.on('click', (e, x, z) => {
                console.log('Bcgr clicked: ', e, x, z)
            });

            const map = (this._map as L.Map);
            const updateCallback = () => {
                features.attr('transform', d => {
                    const translatedCoords = map.latLngToLayerPoint([d.location.x, d.location.y]);
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