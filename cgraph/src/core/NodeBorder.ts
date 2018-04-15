namespace SciViCGraph
{
    export class NodeBorder extends Curve
    {
        private static readonly m_thickness = 3.0;

        constructor()
        {
            super();

            this.addColor({ from: 0xFD3C00, to: 0xFD3C00, alpha: 1.0 });
        }

        public showForNode(node: Node)
        {
            if (node === null)
                this.visible = false;
            else {
                this.position = node.position;
                this.rotation = node.rotation;

                let size = node.labelSize(false);
                size.width += NodeBorder.m_thickness;
                size.height += NodeBorder.m_thickness;
                const x = 0;
                const y = -size.height / 2.0;

                this.visible = true;

                this.clear();
                this.lineStyle(3.0, 0x0, 1);
                this.moveTo(x, y);
                this.lineTo(x + size.width, y);
                this.lineTo(x + size.width, y + size.height);
                this.lineTo(x + NodeBorder.m_thickness / 2.0, y + size.height);
                this.lineTo(x + NodeBorder.m_thickness / 2.0, y);
            }
        }
    }
}
