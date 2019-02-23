namespace SciViCGraph
{
    export class Scale
    {
        constructor(protected m_steps: any[], protected m_colors: number[], protected m_textColors: number[],
                    protected m_names: string[], public getValue: (node: Node) => any)
        {
            // nop
        }

        public classifyNode(node: Node): number
        {
            return this.getStepID(node);
        }

        public getStepID(node: Node): number
        {
            let n = this.m_steps.length;
            let i = 0;
            for (; i < n; ++i) {
                if (this.getValue(node) < this.m_steps[i])
                    break;
            }
            return i;
        }

        public getName(id: number): string
        {
            return this.m_names[id];
        }

        public getColor(id: number): number
        {
            return this.m_colors[id % this.m_colors.length];
        }

        public getTextColor(id: number): number
        {
            return this.m_textColors[id % this.m_textColors.length];
        }
    }

    export class DiscreteScale extends Scale
    {
        public getStepID(node: Node): number
        {
            const v = this.getValue(node);
            for (let i = 0, n = this.m_steps.length; i < n; ++i) {
                if (Geometry.sortedArrayIncludesValue(this.m_steps[i], v))
                    return i;
            }
            return undefined;
        }
    }
}
