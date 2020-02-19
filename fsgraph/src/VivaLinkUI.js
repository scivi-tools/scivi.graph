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
        super(graphics, edge.id);
        //связь
        this.link = edge;
        //координаты начала и конца
        /** @type {Ngraph.Graph.Position2} */
        this.pos = {
            from: new Point2D(),
            to: new Point2D(),
        };
        //this._graphics = graphics;

        // TODO: workaround assert if interface is implemented
        // https://github.com/Microsoft/TypeScript/issues/17498#issuecomment-399439654   
        /** @type {VivaGeneric.LinkUI} */
        const assertion = this;
    }

    get size()
    {
        const minSize = 1.5;
        const maxSize = 5.0;
        let size = Math.min(Math.max(minSize, this._size), maxSize);
        const scaleRate = this.graphics.getScaleFactor();
        const graphSize = this.link.data._state.graphSize;
        const coeff = 0.1 * Math.log(3.0 - scaleRate) / scaleRate + 0.1/scaleRate + 1.0;
        return size * (coeff > 1.0 ? Math.min(coeff, 2.0) : 1.0);
    }

    set size(value)
    {
        this._size = value;
    }
}
