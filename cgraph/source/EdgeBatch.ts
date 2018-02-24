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

        private bringToFront()
        {
            let p = this.parent;
            if (p) {
                p.removeChild(this);
                p.addChild(this);
            }
        }

        private bringToBack()
        {
            let p = this.parent;
            if (p) {
                p.removeChild(this);
                p.addChildAt(this, 0);
            }
        }

        private update()
        {
            let p = this.parent as Scene;

            this.clear();

            this.m_colors = [];

            this.m_edges.forEach((edge) => {
                if (edge.visible) {
                    edge.thickness = Edge.minThickness + (Edge.maxThickness - Edge.minThickness) * edge.weight / p.maxEdgeWeight;
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

        get isFull(): boolean
        {
            return this.m_edges.length == 10;
        }
    }
}
