namespace SciViCGraph
{
    export class RingPlaceHolder extends Curve
    {
        private m_index: number;

        constructor()
        {
            super();

            this.addColor({ from: 0xFD3C00, to: 0xFD3C00, alpha: 1.0 });
            this.m_index = -1;
        }

        public showForRing(index: number, ring: RingScale): boolean
        {
            if (index !== this.m_index) {
                this.m_index = index;
                if (index === -1) {
                    this.visible = false;
                } else {
                    this.visible = true;
                    this.clear();
                    this.lineStyle(6.0, 0x0, 1);
                    this.arc(0.0, 0.0, ring.radius + ring.width / 2.0, 0.0, 2.0 * Math.PI + 0.001, false);
                }
                return true;
            }
            return false;
        }
    }
}
