

/**
 * @implements {Ngraph.Graph.Position}
 */
export class Point2D {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;

        // TODO: workaround assert if interface is implemented
        // https://github.com/Microsoft/TypeScript/issues/17498#issuecomment-399439654  
        /** @type {Ngraph.Graph.Position} */
        const assertion = this;
    }

    get angle() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * 
     * @param {Point2D | Ngraph.Graph.Position} from 
     * @param {Point2D | Ngraph.Graph.Position} what 
     */
    static Subtract(from, what) {
        return new Point2D(from.x - what.x, from.y - what.y);
    }
}
