/**
 * Такая себе заглушечка для более продвинутого инструментария подсчёта метрик графа
 */
//@ts-check
import { Node } from './Node'

/** @typedef {Object.<string, number[]>} MetricsContainer */

export class DummyMetrics {
    /**
     * 
     * @param {string[]} monitoredValues 
     */
    constructor(monitoredValues) {
        /** @type {MetricsContainer} */
        this.minMaxValues = {};
        /** @type {MetricsContainer[]} */
        this.minMaxValuesPerGroup = [];

        this.monitoredValues = monitoredValues;

        /** @type {number} */
        this.maxWeight = -Infinity;
        /** @type {number} */
        this.maxGroupId = -1;
    }

    /**
     * @param {any} container 
     * @param {MetricsContainer} container2 
     */
    _mergeMaxs(container, container2) {
        Object.keys(container).forEach(element => {
            if (this.monitoredValues.indexOf(element) >= 0) {
                let value = container[element];

                if (Object.keys(container2).indexOf(element) >= 0) {
                    if (value > container2[element][1]) {
                        container2[element][1] = value;
                    } else if (value < container2[element][0]) {
                        container2[element][0] = value;
                    }
                } else {
                    container2[element] = [value, value];
                    // container2[element][1] = container2[element][0] = value;
                }
            }
        });
    }

    /**
     * 
     * @param {MetricsContainer} container 
     * @param {MetricsContainer} container2 
     */
    _mergeMaxs2(container, container2) {
        Object.keys(container).forEach(element => {
            if (this.monitoredValues.indexOf(element) >= 0) {
                let value = container[element];

                if (Object.keys(container2).indexOf(element) >= 0) {
                    if (value[1] > container2[element][1]) {
                        container2[element][1] = value[1];
                    }
                    if (value[0] < container2[element][0]) {
                        container2[element][0] = value[0];
                    }
                } else {
                    container2[element] = value;
                }
            }
        });
    }

    /**
     * 
     * @param {Node} node 
     */
    accumulate(node) {
        this.maxWeight = Math.max(node.weight, this.maxWeight);
        this.maxGroupId = Math.max(node.groupId, this.maxGroupId);

        this._mergeMaxs(node, this.minMaxValues);
        if (!this.minMaxValuesPerGroup[node.groupId]) {
            this.minMaxValuesPerGroup[node.groupId] = {};
        }
        this._mergeMaxs(node, this.minMaxValuesPerGroup[node.groupId]);
    }

    /**
     * 
     * @param {DummyMetrics} metrics 
     */
    accumulateMetric(metrics) {
        this.maxWeight = Math.max(metrics.maxWeight, this.maxWeight);
        this.maxGroupId = Math.max(metrics.maxGroupId, this.maxGroupId);
        
        for (let g = 0; g < metrics.maxGroupId + 1; g++) {
            if (!this.minMaxValuesPerGroup[g]) {
                this.minMaxValuesPerGroup[g] = {};
            }
            this._mergeMaxs2(metrics.minMaxValuesPerGroup[g], this.minMaxValuesPerGroup[g]);
        }
        this._mergeMaxs2(metrics.minMaxValues, this.minMaxValues);
    }
}