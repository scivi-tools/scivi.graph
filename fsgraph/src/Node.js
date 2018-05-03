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
    };

    addEdge(edge) {
       this.edges.push(edge);
    };

    onBeforeHide(layout) {
        let layoutedPos = layout.getNodePosition(this.id);
        this.position.x = layoutedPos.x;
        this.position.y = layoutedPos.y;
    }
}

export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
