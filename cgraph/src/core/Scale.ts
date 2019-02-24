namespace SciViCGraph
{
    export class Scale
    {
        private m_applicable: boolean;

        constructor(protected m_steps: any[], protected m_colors: number[], protected m_textColors: number[],
                    protected m_names: string[], public getValue: (node: Node) => any)
        {
            this.m_applicable = true;
        }

        public checkApplicability(nodes: Node[]): boolean
        {
            this.m_applicable = false;
            for (let i = 0, n = nodes.length; i < n; ++i) {
                if (this.classifyNode(nodes[i]) !== undefined) {
                    this.m_applicable = true;
                    break;
                }
            }
            return this.m_applicable;
        }

        get applicable(): boolean
        {
            return this.m_applicable;
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
