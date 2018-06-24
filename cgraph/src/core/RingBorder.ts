namespace SciViCGraph
{
    export class RingBorder extends Curve
    {
        constructor()
        {
            super();

            this.addColor({ from: 0xFD3C00, to: 0xFD3C00, alpha: 0.5 });
        }

        public showForRing(ring: RingScale)
        {
            if (ring === null)
                this.visible = false;
            else {
                this.clear();
                this.lineStyle(ring.width, 0x0, 1);
                this.arc(0.0, 0.0, ring.radius, 0.0, 2.0 * Math.PI + 0.001, false);

                this.visible = true;
            }
        }
    }
}
