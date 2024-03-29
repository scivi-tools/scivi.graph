namespace SciViCGraph
{
    export class EdgeBatch extends Curve
    {
        private m_edges: Edge[];
        private m_needsUpdate: boolean;
        private m_move: number;

        constructor()
        {
            super();

            this.m_edges = [];
            this.m_needsUpdate = false;
            this.m_move = 0;
        }

        private drawCurve(curve: Curve, cp: Point[], thickness: number, fromColor: number, toColor: number, alpha: number,
                          arrow: boolean, arrowLength: number, arrowThickness: number)
        {
            if (!arrow)
                arrowLength = arrowThickness = 0.0;
            curve.lineStyle(thickness, 0x0, 1);
            curve.addColor({ from: fromColor, to: toColor, alpha: alpha });
            curve.moveTo(cp[0].x, cp[0].y);
            if (cp.length === 3)
                curve.quadraticCurveWithArrowTo(cp[1].x, cp[1].y, cp[2].x, cp[2].y, arrowLength, arrowThickness);
            else
                curve.bezierCurveWithArrowTo(cp[1].x, cp[1].y, cp[2].x, cp[2].y, cp[3].x, cp[3].y, arrowLength, arrowThickness);
        }

        private update()
        {
            let p = this.parent as Scene;

            this.clear();

            this.m_edges.forEach((edge) => {
                if (edge.visible) {
                    if (p.edgeWeight.max > p.edgeWeight.min) {
                        edge.thickness = Edge.minThickness +
                                         (Edge.maxThickness - Edge.minThickness) / (p.edgeWeight.max - p.edgeWeight.min) *
                                         (edge.weight - p.edgeWeight.min);
                    } else {
                        edge.thickness = (Edge.minThickness + Edge.maxThickness) / 2.0;
                    }
                    const arrowSize = Math.pow(edge.thickness * 210, 1.0 / 2.5);
                    this.drawCurve(this, edge.controlPoints(), edge.thickness, edge.fromColor, edge.toColor, edge.alpha,
                                   edge.isDirected, arrowSize, arrowSize);
                }
            });

            if (this.m_move > 0)
                this.bringToFront();
            else if (this.m_move < 0)
                this.bringToBack();
            this.m_move = 0;
        }

        public addEdge(edge: Edge)
        {
            this.m_edges.push(edge);
            edge.setBatch(this);
            this.m_needsUpdate = true;
        }

        public setNeedsUpdate()
        {
            this.m_needsUpdate = true;
        }

        public sendToFront()
        {
            this.m_move = 1;
        }

        public sendToBack()
        {
            this.m_move = -1;
        }

        public resetMove()
        {
            this.m_move = 0;
        }

        public prepare(): boolean
        {
            if (this.m_needsUpdate) {
                this.update();
                this.m_needsUpdate = false;
                return true;
            } else {
                return false;
            }
        }

        public createGlow(edge: Edge): Curve
        {
            let result = new Curve();
            this.parent.addChild(result);
            const arrowSize = Math.pow(edge.thickness * 210, 1.0 / 2.5);
            this.drawCurve(result, edge.controlPoints(), edge.thickness * 2.0, 0xFF0000, 0xFF0000, 0.5,
                           edge.isDirected, arrowSize * 1.15, arrowSize * 1.65);
            return result;
        }

        get isFull(): boolean
        {
            return this.m_edges.length === 10;
        }
    }
}
