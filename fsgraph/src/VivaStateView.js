/* TODO: Пересматриваем концепцию кастомизации отображения графа
 * Теперь этот класс будет содержать инфу о том, как визуализировать связи
 * и вершины (последнее - для каждой группы)
 * Сюда нужно включить отображение размера вершин,
 * их цвета (+ связей) для всех состояний: (не)выбрано/(не)активно
 */
//@ts-check

const maxNodeSizeDiap = [0, 200];

/**
 * Что-то типа ViewRules - правила отображения
 */
export class VivaStateView {
    // TODO: цвета-цветы передавать где-то здесь
    // хранить тащем-та тоже
    // картинки тоже
    constructor(colorPairs, imgSources) {

        // TODO: clon array right way
        this._nodeSizeDiap = [];
        this._nodeSizeDiap[0] = maxNodeSizeDiap[0];
        this._nodeSizeDiap[1] = maxNodeSizeDiap[1];

        this._colorPairs = colorPairs;

        /** @type {function(any) : void} */
        this.onNodeRender = stub;
        /** @type {function(any) : void} */
        this.onEdgeRender = stub;
    }

    get nodeSizeDiap() {
        return this._nodeSizeDiap;
    }

    setNodeSizeDiap(from, to) {
        let diap = this._nodeSizeDiap;
        let changed = (from != diap[0]) || (to != diap[1]);
        if (changed) {
            diap[0] = from;
            diap[1] = to;
        }
    }

    /**
     * 
     * @param {number} value 
     * @param {number} maxValue 
     */
    getNodeUISize(value = 1, maxValue = 1) {
        let diap = this._nodeSizeDiap;
        // TODO: максимальный вес вершин нужно хранить где-то в состоянии графа (по группам!)
        return (value >= 0)
            ? (diap[0] + (diap[1] - diap[0]) * value / maxValue)
            : diap[0];
    }
}

function stub() {
    ;
}
