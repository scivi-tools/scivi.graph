namespace SciViCGraph
{
    export class HyperEdge
    {
        private m_border: Curve;
        private m_needsUpdate: boolean;

        constructor(public nodes: Node[])
        {
            this.m_border = null;
            this.m_needsUpdate = false;
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

        public addToScene(scene: Scene)
        {
            if (!this.m_border)
                this.m_border = new Curve();
            scene.addChild(this.m_border);
            this.m_needsUpdate = true;
        }

        public setNeedsUpdate()
        {
            this.m_needsUpdate = true;
        }

        private controlPoint(from: Node, to: Node): Point
        {
            const h = 30.0;
            const ft = { x: to.x - from.x, y: to.y - from.y };
            const l = Math.sqrt(ft.x * ft.x + ft.y * ft.y);
            const c = { x: (from.x + to.x) / 2.0, y: (from.y + to.y) / 2.0 };
            return { x: -ft.y / l * h + c.x, y: ft.x / l * h + c.y };
        }

        private update()
        {
            if (this.m_border && this.nodes.length > 0) {
                const thickness = 2.0;
                const alpha = 1.0;
                let nodesToDraw = this.nodes.filter((node) => {
                    return node.visible;
                });
                nodesToDraw.sort((a, b) => {
                    return a.rotation < b.rotation ? -1 : a.rotation > b.rotation ? 1 : 0;
                });
                this.m_border.clear();
                this.m_border.lineStyle(thickness, 0x0, 1);
                const n = nodesToDraw.length;
                if (n > 1) {
                    for (let i = 0; i < n; ++i) {
                        const fromNode = nodesToDraw[i];
                        const toNode = nodesToDraw[(i + 1) % n];
                        const cp = this.controlPoint(fromNode, toNode);
                        this.m_border.addColor({ from: fromNode.groupColor, to: toNode.groupColor, alpha: alpha });
                        this.m_border.moveTo(fromNode.x, fromNode.y);
                        this.m_border.quadraticCurveWithArrowTo(cp.x, cp.y, toNode.x, toNode.y, 0.0, 0.0);
                    }
                }
            }
        }
    }
}