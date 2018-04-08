//@ts-check

export class Node {
    constructor(id, groupId, label, weight, data) {
        this.id = id;
        this.label = label;
        this.groupId = groupId;
        this.weight = weight;
        this.data = data;

        this.forceShowed = false;
        this.visible = true;

        this.edges = [];

        this.detailedInfoHTML = document.createElement("div");
    };

    addEdge(edge) {
       this.edges.push(edge);
    };

    buildDetailedInfo() {
        let header = document.createElement("div");
        let name = document.createElement("input");
        name.type = "text";
        name.value = this.label;
        name.style.fontWeight = "bold";
        name.style.width = "300px";
        name.style.marginRight = "5px";
        let changeName = document.createElement("button");
        changeName.innerHTML = "Change name";
        changeName.onclick = () => {
            this.label = name.value;
            // this.m_svRenderer.updateNodeNames();
        };
        header.appendChild(name);
        header.appendChild(changeName);

        /*if (this.realNode.date) {
            let dateLabel = document.createElement("span");
            dateLabel.innerHTML = "&nbsp;&nbsp;&nbsp;(" + this.date.toLocaleDateString() + ")";
            header.appendChild(dateLabel);
        }*/

        let nodesList = document.createElement("div");
        let connList = "<div>Linked nodes:</div><ul>";
        this.edges.forEach((edge) => {
            if (edge.visible) {
                if (edge.target != this.id)
                    connList += "<li>--+ " + edge.target + "</li>";
                else
                    connList += "<li>+-- " + edge.source + "</li>";
            }
        });
        connList += "</ul>";
        nodesList.innerHTML = connList;

        while (this.detailedInfoHTML.firstChild)
            this.detailedInfoHTML.removeChild(this.detailedInfoHTML.firstChild);

        this.detailedInfoHTML.appendChild(header);
        this.detailedInfoHTML.appendChild(nodesList);
    };
};