import { GraphController } from "./Core/GraphController";
import * as L from "leaflet";

import 'leaflet/dist/leaflet.css'
import * as d3 from "d3";

export class Renderer {
    private _controller: GraphController | null = null;
    private _map: L.Map | null = null;
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
        this._map = L.map('scivi_map_root').setView([0, 0], 0);
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: `&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors`,
            maxZoom: 18
        }).addTo(this._map);
        L.svg().addTo(this._map);
        
        const svg = d3.select(this._map.getPanes().overlayPane).select('svg');
        this._g = svg.select('g');

        return this;
    }

    run(): Renderer {

        if (!!this._controller && !!this._g) {
            const features = this._g.selectAll('circle')
                .data(this._controller.currentState.nodes)
                .enter().append("circle")
                .style("stroke", "black")  
                .style("opacity", .6) 
                .style("fill", "red")
                .attr("r", 20);
            
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