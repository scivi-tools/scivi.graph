export class VivaBaseUI {
    constructor(id, size = 1, color = 0x000000ff) {
        this._id = id;
        this.size = size;
        this.color = color;
    };

    get id() {
        return this._id;
    }

    onPlaceUI() {
        ;
    };
};