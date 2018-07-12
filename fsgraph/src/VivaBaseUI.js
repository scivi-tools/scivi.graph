export class VivaBaseUI {
    /**
     * 
     * @param {number} id 
     * @param {number} size 
     * @param {number} color 
     */
    constructor(id, size = 1, color = 0x000000ff) {
        /** @type {number} */
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