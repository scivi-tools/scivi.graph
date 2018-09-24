namespace SciViCGraph
{
    export class RingScaleSegment extends Curve
    {
        constructor(private m_from: number, private m_to: number,
                    private m_width: number, private m_radius: number,
                    private m_color: number, private m_alpha: number,
                    private m_name, private m_textColor)
        {
            super();

            this.lineStyle(this.m_width, 0x0, 1);
            this.m_colors.push({ from: this.m_color, to: this.m_color, alpha: this.m_alpha });
            this.arc(0, 0, this.m_radius, this.m_from, this.m_to, false);
            this.visible = false;
        }

        public containsAngle(angle: number): boolean
        {
            if (angle < 0.0)
                angle += 2.0 * Math.PI;
            if (this.m_from < 0.0) {
                if (this.m_to < 0.0)
                    angle -= 2.0 * Math.PI;
                else
                    return angle - 2.0 * Math.PI >= this.m_from || angle < this.m_to;
            }
            return angle >= this.m_from && angle < this.m_to;
        }

        get fromAngle(): number
        {
            return this.m_from;
        }

        get toAngle(): number
        {
            return this.m_to;
        }

        get radius(): number
        {
            return this.m_radius;
        }

        get color(): number
        {
            return this.m_color;
        }

        get name(): string
        {
            return this.m_name;
        }

        get textColor(): number
        {
            return this.m_textColor;
        }

        public matches(segment: RingScaleSegment): boolean
        {
            return this.m_from === segment.fromAngle && this.m_to === segment.toAngle && this.m_radius === segment.radius;
        }

        public doCopy(): RingScaleSegment
        {
            return new RingScaleSegment(this.m_from, this.m_to, this.m_width, this.m_radius,
                                        this.m_color, this.m_alpha, this.m_name, this.m_textColor);
        }
    }
}
