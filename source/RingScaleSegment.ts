namespace SciViGraph
{
    export class RingScaleSegment extends Curve
    {
        constructor(private m_from: number, private m_to: number, width: number, radius: number, color: number)
        {
            super();

            this.lineStyle(width, 0x0, 1);
            this.m_colors.push({ from: color, to: color, alpha: 0.1 });
            this.arc(0, 0, radius, this.m_from, this.m_to, false);
            this.visible = false;
        }

        public containsAngle(angle: number): boolean
        {
            if (this.m_from < 0.0) {
                if (this.m_to < 0.0)
                    angle -= 2.0 * Math.PI;
                else
                    return angle - 2.0 * Math.PI >= this.m_from || angle < this.m_to
            }
            return angle >= this.m_from && angle < this.m_to;
        }
    }
}
