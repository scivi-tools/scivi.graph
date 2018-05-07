/**
 * Такая себе заглушечка для более продвинутого инструментария подсчёта метрик графа
 */
//@ts-check
import { Node } from './Node'

export class DummyMetrics {
    constructor() {
        this.maxWeight = -Infinity;
        this.maxGroupId = 0;
    }

    /**
     * 
     * @param {Node} node 
     */
    accumulate(node) {
        this.maxWeight = Math.max(node.weight, this.maxWeight);
        this.maxGroupId = Math.max(node.groupId, this.maxGroupId);
    }

    /**
     * 
     * @param {DummyMetrics} metrics 
     */
    accumulateMetric(metrics) {
        this.maxWeight = Math.max(metrics.maxWeight, this.maxWeight);
        this.maxGroupId = Math.max(metrics.maxGroupId, this.maxGroupId);
    }
}