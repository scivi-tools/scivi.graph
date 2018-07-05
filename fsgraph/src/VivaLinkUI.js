//@ts-check
///<reference path='./@types/ngraph.d.ts' />
import { VivaBaseUI } from './VivaBaseUI'
import { Edge } from './Edge'

export class VivaLinkUI extends VivaBaseUI {
    /**
     * 
     * @param {*} graphics 
     * @param {NgraphGraph.Link} edge 
     */
    constructor(graphics, edge) {
        super(edge.id);

        this.edge = edge;
    }
};
