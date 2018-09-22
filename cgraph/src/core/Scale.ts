namespace SciViCGraph
{
    export class Scale
    {
        private m_nodeGroups: Node[][];

        constructor(private m_steps: any[], private m_colors: number[], private m_textColors: number[],
                    private m_names: string[], public getValue: (node: Node) => any)
        {
            this.m_nodeGroups = [];
            for (let i = 0; i < this.m_names.length; ++i)
                this.m_nodeGroups.push([]);
        }

        public classifyNode(node: Node): number
        {
            const result = this.getStepID(node);
            this.m_nodeGroups[result].push(node);
            return result;
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

        get groupCount(): number
        {
            return this.m_nodeGroups.length;
        }

        public groupHasContent(id: number): boolean
        {
            return this.m_nodeGroups[id].length > 0;
        }
    }
}
