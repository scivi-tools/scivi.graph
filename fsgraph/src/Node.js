//@ts-check

export class Node {
    constructor(state, id, groupId, label, weight, data = null) {
        this._state = state;
        this.id = id;
        this.label = label;
        this.groupId = groupId;
        this.weight = weight;
        this.data = data;

        this.visible = true;
        this.position = new Position(0, 0);

        this.edges = [];

        //@ts-ignore
        this.detailedInfoHTML = $('#info')[0];
    };

    addEdge(edge) {
       this.edges.push(edge);
    };

    onBeforeHide(layout) {
        let layoutedPos = layout.getNodePosition(this.id);
        this.position.x = layoutedPos.x;
        this.position.y = layoutedPos.y;
    }

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
                    connList += "<li>--+ " + this._state.nodes[edge.toId].label + "</li>";
                else
                    connList += "<li>+-- " + this._state.nodes[edge.fromId].label + "</li>";
            }
        });
        connList += "</ul>";
        nodesList.innerHTML = connList;

        while (this.detailedInfoHTML.firstChild)
            this.detailedInfoHTML.removeChild(this.detailedInfoHTML.firstChild);

        this.detailedInfoHTML.appendChild(header);
        this.detailedInfoHTML.appendChild(nodesList);
    };
}

export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
