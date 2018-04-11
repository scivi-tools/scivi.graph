/* TODO: нужен класс - вьюха графа, где
 * будут храниться все визуалы узлов и связей
 * Эта версия будет вива-специфичная, с использованием визуала узлов
 * с dom-надписями
 */
//@ts-check
import { GraphState } from './GraphState'
import { VivaNodeUI } from './VivaNodeUI'

export class VivaStateView {
    constructor(state, nullnull) {
        /**
         * @type {GraphState} state
         */
        this.state = state;

        this._nodeSizeDiap = [10, 50];

        this._nodesUI = [];
        this._edgesUI = [];
    };

    get nodeSizeDiap() {
        return this._nodeSizeDiap;
    };

    setNodeSizeDiap(from, to) {
        let diap = this._nodeSizeDiap;
        let changed = (from != diap[0]) || (to != diap[1]);
        if (changed) {
            diap[0] = from;
            diap[1] = to;
        }
    };

    /**
     * 
     * @param {VivaNodeUI} nodeUI 
     */
    getNodeUISize(nodeUI) {
        let diap = this._nodeSizeDiap;
        // TODO: максимальный вес вершин нужно хранить где-то в состоянии графа (по группам!)
        return (nodeUI.node.weight >= 0) ? (diap[0] + (diap[1] - diap[0]) * nodeUI.node.weight / 1) : diap[0];
    };
};