namespace SciViCGraph
{
    export class List
    {
        private m_listDiv: JQuery;
        private m_nodes: Node[];

        constructor(private m_list: HTMLElement)
        {
            this.m_listDiv = null;
        }

        private populate()
        {
            this.m_listDiv.empty();
            this.m_nodes.forEach((node) => {
                node.postListItem(this.m_listDiv.get(0));
            });
        }

        private populateBySubstring(sub: string)
        {
            if (sub.length === 0)
                this.populate();
            else {
                this.m_listDiv.empty();
                this.m_nodes.forEach((node) => {
                    if (node.label.indexOf(sub) !== -1)
                        node.postListItem(this.m_listDiv.get(0));
                });
            }
        }

        private populateByMatch(str: string)
        {
            if (str.length === 0)
                this.populate();
            else {
                this.m_listDiv.empty();
                this.m_nodes.forEach((node) => {
                    if (node.label === str)
                        node.postListItem(this.m_listDiv.get(0));
                });
            }
        }

        private populateByRegExp(re: string)
        {
            if (re.length === 0)
                this.populate();
            else {
                this.m_listDiv.empty();
                this.m_nodes.forEach((node) => {
                    if (node.label.match(re))
                        node.postListItem(this.m_listDiv.get(0));
                });
            }
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
                renderer.showAllNodes(true);
            });
            div1.append(showAll);

            let hideAll = $("<button/>");
            hideAll.html(renderer.localizer["LOC_HIDEALL"]);
            hideAll.click(() => {
                renderer.showAllNodes(false);
            });
            div1.append(hideAll);

            let div2 = $("<div>");

            let filter = $("<input/>").attr({ type: "text" });
            filter.width("200px");
            filter.on("input", () => {
                this.populateBySubstring(filter.val());
            });
            div2.append(filter);

            let str = $("<button/>");
            str.html(renderer.localizer["LOC_FINDSTRING"]);
            str.click(() => {
                this.populateByMatch(filter.val());
            });
            div2.append(str);

            let regexp = $("<button/>");
            regexp.html(renderer.localizer["LOC_FINDREGEXP"]);
            regexp.click(() => {
                this.populateByRegExp(filter.val());
            });
            div2.append(regexp);

            this.m_listDiv = $("<div>");

            this.m_list.appendChild(div1.get(0));
            this.m_list.appendChild(div2.get(0));
            this.m_list.appendChild(this.m_listDiv.get(0));

            this.populate();
        }
    }
}
