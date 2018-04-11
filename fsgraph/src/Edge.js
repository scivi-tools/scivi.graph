// @ts-check

export class Edge {
    constructor(state, fromId, toId) {
        this._state = state;
        this.fromId = fromId;
        this.toId = toId;
        
        this._visibleStored = true;
    }

    get visibleChanged() {
        let prevVisible = this._visibleStored;
        return this.visible != prevVisible;
    }

    get visible() {
        let nodeFrom = this._state.nodes[this.fromId];
        let nodeTo = this._state.nodes[this.toId];
        this._visibleStored = nodeFrom.visible && nodeTo.visible;
        return this._visibleStored;
    }

    set visible(value) {
        throw new Error('Edge visibility can not be set!');
    }
}
