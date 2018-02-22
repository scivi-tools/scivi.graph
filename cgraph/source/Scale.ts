namespace SciViCGraph
{
    export class Scale
    {
        constructor(private m_steps: any[], private m_colors: number[], private m_textColors: number[],
                    private m_names: string[], private m_obtainValue: (node: Node) => any)
        {
            // nop
        }

        public getStepID(node: Node): number
        {
            let n = this.m_steps.length;
            let i = 0;
            for (; i < n; ++i) {
                if (this.m_obtainValue(node) < this.m_steps[i])
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
}
