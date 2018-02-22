namespace SciViCGraph
{
    export class List
    {
        constructor(private m_list: HTMLElement)
        {
        }

        public buildList(nodes: Node[], renderer: Renderer)
        {
            while (this.m_list.firstChild)
                this.m_list.removeChild(this.m_list.firstChild);

            let showAll = document.createElement("button");
            showAll.innerHTML = "Показать все";
            showAll.onclick = () => {
                renderer.showAllNodes(true);
            };
            this.m_list.appendChild(showAll);

            let hideAll = document.createElement("button");
            hideAll.innerHTML = "Скрыть все";
            hideAll.onclick = () => {
                renderer.showAllNodes(false);
            };
            this.m_list.appendChild(hideAll);

            nodes.forEach((node) => {
                node.postListItem(this.m_list);
            });
        }
    }
}
