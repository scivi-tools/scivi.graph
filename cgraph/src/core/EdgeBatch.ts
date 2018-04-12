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

        private update()
        {
            let p = this.parent as Scene;

            this.clear();

            this.m_colors = [];

            this.m_edges.forEach((edge) => {
                if (edge.visible) {
                    edge.thickness = Edge.minThickness +
                                     (Edge.maxThickness - Edge.minThickness) / (p.edgeWeight.max - p.edgeWeight.min) *
                                     (edge.weight - p.edgeWeight.min);
                    this.moveTo(edge.source.x, edge.source.y);
                    this.lineStyle(edge.thickness, 0x0, 1);
                    this.m_colors.push({ from: edge.fromColor, to: edge.toColor, alpha: edge.alpha });
                    this.quadraticCurveTo(0, 0, edge.target.x, edge.target.y);
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
            result.moveTo(edge.source.x, edge.source.y);
            result.lineStyle(edge.thickness * 2.0, 0x0, 1);
            result.addColor({ from: 0xFF0000, to: 0xFF0000, alpha: 0.5 });
            result.quadraticCurveTo(0, 0, edge.target.x, edge.target.y);
            return result;
        }

        get isFull(): boolean
        {
            return this.m_edges.length == 10;
        }
    }
}
