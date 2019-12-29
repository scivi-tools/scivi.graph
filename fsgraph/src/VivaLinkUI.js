import { VivaBaseUI } from './VivaBaseUI';
import { Point2D } from './Point2D';

/**
 * @implements {VivaGeneric.LinkUI}
 */
export class VivaLinkUI extends VivaBaseUI {
    /**
     *
     * @param {*} graphics
     * @param {Ngraph.Graph.Link} edge
     */
    constructor(graphics, edge) {
        super(edge.id);
        //связь
        this.link = edge;
        //координаты начала и конца
        /** @type {Ngraph.Graph.Position2} */
        this.pos = {
            from: new Point2D(),
            to: new Point2D(),
        };

        // TODO: workaround assert if interface is implemented
        // https://github.com/Microsoft/TypeScript/issues/17498#issuecomment-399439654   
        /** @type {VivaGeneric.LinkUI} */
        const assertion = this;
    }
};
