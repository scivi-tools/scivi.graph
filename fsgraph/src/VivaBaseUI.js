import { SelectionMode } from "./SelectionMode";

export class VivaBaseUI {
    /**
     * @param {VivaGeneric.WebGlGraphics} graphics
     * @param {number} id 
     * @param {number} size 
     * @param {number} color 
     */
    constructor(graphics, id, size = 1, color = 0x000000ff) {
        /** @type {number} */
        this._id = id;
        this._size = size;
        this.color = color;
        /** @type SelectionMode */
        this._selectionMode = SelectionMode.NONE;
        this.graphics = graphics;
    };

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get size()
    {
        return this._size;
    }

    set size(value)
    {
        this._size = value;
    }

    get selectionMode(){
        return this._selectionMode;
    }
    set selectionMode(value)
    {
        this._selectionMode = value;
        this.onSelectedChanged();
    }

    isSelected()
    {
        return this._selectionMode === SelectionMode.SELECTED_BY_USER ||
            this._selectionMode === SelectionMode.SELECTED_LIKE_ADJACENT;
    }



    onSelectedChanged()
    {

    }


    onPlaceUI() {
        ;
    };
};
