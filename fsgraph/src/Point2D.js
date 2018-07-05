//@ts-check
///<reference path='./@types/ngraph.d.ts' />


export class Point2D {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    get angle() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * 
     * @param {Point2D | NgraphGraph.Position} from 
     * @param {Point2D | NgraphGraph.Position} what 
     */
    static Subtract(from, what) {
        return new Point2D(from.x - what.x, from.y - what.y);
    }
}
