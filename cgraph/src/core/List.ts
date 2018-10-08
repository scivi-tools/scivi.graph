namespace SciViCGraph
{
    enum ListFilterType
    {
        NoFilter,
        SubstringFilter,
        StringFilter,
        RegExpFilter
    }

    export class List
    {
        private m_listDiv: JQuery;
        private m_nodes: Node[];
        private m_listedNodes: Node[];

        constructor(private m_list: HTMLElement)
        {
            this.m_listDiv = null;
            this.m_nodes = null;
            this.m_listedNodes = null;
        }

        private matchStr(str: string, pattern: string, type: ListFilterType): boolean
        {
            if (pattern === null || pattern.length === 0)
                return true;
            else {
                switch (type) {
                    case ListFilterType.NoFilter:
                        return true;

                    case ListFilterType.SubstringFilter:
                        return str.indexOf(pattern) !== -1;

                    case ListFilterType.StringFilter:
                        return str === pattern;

                    case ListFilterType.RegExpFilter:
                        return str.match(pattern) !== null;
                }
            }

            return false;
        }

        private populate(pattern: string, type: ListFilterType)
        {
            this.m_listDiv.empty();
            this.m_listedNodes = [];
            this.m_nodes.forEach((node) => {
                if (this.matchStr(node.label, pattern, type)) {
                    node.postListItem(this.m_listDiv.get(0));
                    this.m_listedNodes.push(node);
                }
            });
        }

        public buildList(nodes: Node[], renderer: Renderer)
        {
            this.m_nodes = nodes;

            while (this.m_list.firstChild)
                this.m_list.removeChild(this.m_list.firstChild);

            let div1 = $("<div>");

            let showAll = $("<button/>");
            showAll.html(renderer.localizer["LOC_SHOWALL"]);
            showAll.click(() => {
                this.m_listedNodes.forEach((node) => {
                    node.isShown = true;
                });
                renderer.updateNodesVisibility();
            });
            div1.append(showAll);

            let hideAll = $("<button/>");
            hideAll.html(renderer.localizer["LOC_HIDEALL"]);
            hideAll.click(() => {
                this.m_listedNodes.forEach((node) => {
                    node.isShown = false;
                });
                renderer.updateNodesVisibility();
            });
            div1.append(hideAll);

            let div2 = $("<div>");

            let filter = $("<input/>").attr({ type: "text" });
            filter.width("200px");
            filter.on("input", () => {
                this.populate(filter.val(), ListFilterType.SubstringFilter);
            });
            div2.append(filter);

            let str = $("<button/>");
            str.html(renderer.localizer["LOC_FINDSTRING"]);
            str.click(() => {
                this.populate(filter.val(), ListFilterType.StringFilter);
            });
            div2.append(str);

            let regexp = $("<button/>");
            regexp.html(renderer.localizer["LOC_FINDREGEXP"]);
            regexp.click(() => {
                this.populate(filter.val(), ListFilterType.RegExpFilter);
            });
            div2.append(regexp);

            this.m_listDiv = $("<div>");

            this.m_list.appendChild(div1.get(0));
            this.m_list.appendChild(div2.get(0));
            this.m_list.appendChild(this.m_listDiv.get(0));

            this.populate(null, ListFilterType.NoFilter);
        }
    }
}
