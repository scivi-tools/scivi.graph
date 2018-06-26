namespace SciViCGraph
{
    export class RingPlaceHolder extends Curve
    {
        private m_radius: number;

        constructor()
        {
            super();

            this.addColor({ from: 0xFD3C00, to: 0xFD3C00, alpha: 1.0 });
            this.m_radius = -1;
        }

        public showForRing(radius: number): boolean
        {
            if (radius !== this.m_radius) {
                this.m_radius = radius;
                if (radius === -1) {
                    this.visible = false;
                } else {
                    this.visible = true;
                    this.clear();
                    this.lineStyle(6.0, 0x0, 1);
                    this.arc(0.0, 0.0, radius, 0.0, 2.0 * Math.PI + 0.001, false);
                }
                return true;
            }
            return false;
        }
    }
}
