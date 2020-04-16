import { VivaBaseUI } from './VivaBaseUI';
import { Point2D } from './Point2D';
import {webglGraphics, maxScaleRate, minScaleRate} from "./VivaMod/webglGraphics";
import {VivaStateView, LinearInterpolation} from "./VivaStateView";


/**
 * @return {number}
 */
export function LinearSpline(x, x1, x2, x3, y1, y2, y3) {
    if (x < x2)
    {
        return LinearInterpolation(x, x1, x2, y1, y2);
    }
    else
    {
        return LinearInterpolation(x, x2, x3, y2, y3);
    }
}

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
        const graphSize = this.link.data._state.graphSize;
        const scaleRate = this.graphics.getScaleFactor();
        let size = this._size;
        let maxSizeCoeff = 6.0;//scale = 0.01
        let midSizeCoeff = 2.0;
        let midScaleRate = 0.5;
        let minSizeCoeff = 1.0;//scale = 2
        const coeff = LinearSpline(scaleRate, minScaleRate, midScaleRate, maxScaleRate, maxSizeCoeff, midSizeCoeff,  minSizeCoeff);
        return size * coeff;
    }

    set size(value)
    {
        this._size = value;
    }
}
