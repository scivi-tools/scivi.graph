namespace SciViGraph
{
    export class List
    {
        constructor(private m_list: HTMLElement)
        {
        }

        public buildList(nodes: Node[])
        {
            while (this.m_list.firstChild)
                this.m_list.removeChild(this.m_list.firstChild);

            nodes.forEach((node) => {
                node.postListItem(this.m_list);
            });
        }
    }
}
