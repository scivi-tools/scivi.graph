export class VivaBaseUI {
    constructor(id, size = 1, color = 0x000000ff) {
        this._id = id;
        this.size = size;
        this.color = color;
        this.selected = false;
    };

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    onPlaceUI() {
        ;
    };
};