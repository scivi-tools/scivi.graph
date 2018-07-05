//@ts-check
/// <reference path='./@types/ngraph.d.ts' />
import { VivaBaseUI } from './VivaBaseUI';
import { Edge } from './Edge';
import { Point2D } from './Point2D';

/**
 * @implements {NgraphGeneric.LinkUI}
 */
export class VivaLinkUI extends VivaBaseUI {
    /**
     * 
     * @param {*} graphics 
     * @param {NgraphGraph.Link} edge 
     */
    constructor(graphics, edge) {
        super(edge.id);

        this.link = edge;

        /** @type {NgraphGraph.Position2} */
        this.pos = {
            from: new Point2D(),
            to: new Point2D(),
        };

        // TODO: workaround assert if interface is implemented
        // https://github.com/Microsoft/TypeScript/issues/17498#issuecomment-399439654   
        /** @type {NgraphGeneric.LinkUI} */
        const assertion = this;
    }
};
