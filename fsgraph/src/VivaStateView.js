
import { Node } from './Node'
import { VivaImageNodeUI } from './VivaImageNodeUI'
import { VivaLinkUI } from './VivaLinkUI'
import { VivaWebGLRenderer } from './VivaWebGLRenderer'
import { getOrCreateTranslatorInstance } from '@scivi/utils'
import * as $ from 'jquery'
import 'jquery-ui/ui/widgets/slider'
import { ColorConverter } from './ColorConverter';
import { RENDERER_MAP } from './VivaMod/ProxyGroupNodeRenderer';

/* TODO: Пересматриваем концепцию кастомизации отображения графа
 * Теперь этот класс будет содержать инфу о том, как визуализировать связи
 * и вершины (последнее - для каждой группы)
 * Сюда нужно включить отображение размера вершин,
 * их цвета (+ связей) для всех состояний: (не)выбрано/(не)активно
 */

const _MaxNodeSizeDiap = [1, 50];
const _NodeSizeStep = 1;
const _DefNodeSizeDiap = [7, 45];
const _MaxEdgeSizeDiap = [0.5, 50];
const _EdgeSizeStep = 0.5;
const _DefEdgeSizeDiap = [1, 5];

/**
 * Что-то типа ViewRules - правила отображения
 */
export class VivaStateView {
    // TODO: цвета-цветы передавать где-то здесь
    // хранить тащем-та тоже
    // картинки тоже
    /**
     * 
     * @param {number[]} colorPairs 
     * @param {string[]} nodeTypes 
     * @param {VivaWebGLRenderer} renderer 
     */
    constructor(colorPairs, nodeTypes, renderer) {

        // TODO: clon array right way
        /** @type {number[]} */
        this._nodeSizeDiap = _DefNodeSizeDiap.slice();
        /** @type {number[]} */
        this._edgeSizeDiap = _DefEdgeSizeDiap.slice();

        this._colorPairs = colorPairs;
        /** Node, then edge */
        this._elementAlpha = [this._colorPairs[2] & 0xFF, this._colorPairs[0] & 0xFF];
        for (let i = 2; i < this._colorPairs.length; i += 2) {
            this._colorPairs[i] = VivaStateView.getInactiveColor(this._colorPairs[i] >> 8, this._colorPairs[i] & 0xFF);
        }
        this._srcAlpha = [this._colorPairs[3] & 0xFF, this._colorPairs[1] & 0xFF];

        /** @type {function(VivaImageNodeUI) : void} */
        this.onNodeRender = stub;
        /** @type {function(VivaLinkUI) : void} */
        this.onEdgeRender = stub;

        /** @type {Function} */
        this.onSettingsUpdate = stub;

        /** @type {function(string, number): void} */
        this.onNodeTypeChange = stub;

        /** @type {function(VivaImageNodeUI, Ngraph.Graph.Graph, VivaWebGLRenderer) : void} */
        this.onNodeClick = selectNode2G;

        /** @type {VivaWebGLRenderer} */
        this._renderer = renderer;

        this.nodeTypes = nodeTypes;

        this._buildUI();
    }

    /**
     * 
     * @param {number[]} diap 
     * @param {number} from 
     * @param {number} to 
     * @returns {void}
     */
    _setDiap(diap, from, to) {
        let changed = (from != diap[0]) || (to != diap[1]);
        if (changed) {
            diap[0] = from;
            diap[1] = to;
        }
    }

    /**
     * 
     * @param {number[]} diap 
     * @param {number} value
     * @param {number} maxValue
     * @returns {number}
     */
    _getInterpolated(diap, value, maxValue) {
        return (value >= 0)
        ? (diap[0] + (diap[1] - diap[0]) * value / maxValue)
        : diap[0];
    }

    /**
     * 
     * @param {number} value 
     * @param {number} maxValue 
     * @returns {number}
     */
    getNodeUISize(value = 1, maxValue = 1) {
        // TODO: максимальный вес вершин нужно хранить где-то в состоянии графа (по группам!)
        return this._getInterpolated(this._nodeSizeDiap, value, maxValue);
    }

    /**
     * 
     * @param {number} value 
     * @param {number} maxValue 
     * @returns {number}
     */
    getEdgeUISize(value = 1, maxValue = 1) {
        return this._getInterpolated(this._edgeSizeDiap, value, maxValue);
    }

    _buildUI() {
        let baseContainer = $('#scivi_fsgraph_settings_appearance')[0];
        let innerContainer = document.createElement('div');
        innerContainer.id = 'scivi_fsgraph_settings_stateview';
        const tr = getOrCreateTranslatorInstance();

        const namedDiaps = document.createElement('ul');
        // TODO: done this right way
        const diapNames = [tr.apply('#node_size_diap'), tr.apply('#edge_size_diap')];
        const diapRanges = [_MaxNodeSizeDiap, _MaxEdgeSizeDiap];
        const diapSteps = [_NodeSizeStep, _EdgeSizeStep];
        const diapSetters = [this._nodeSizeDiap, this._edgeSizeDiap];
        const alphaDiapNames = [tr.apply('#node_alpha'), tr.apply('#edge_alpha')];
        for (let i = 0; i < 2; i++) {
            const diapLi = document.createElement('li');
            const label = document.createElement('span');
            label.innerText = `${diapNames[i]}: `;
            const numLabel = document.createElement('span');
            // TODO: should be done another way
            const setDiapLabel = (/** @type {number[]} */values) => {
                numLabel.innerText = `${values[0]}..${values[1]}`;
            };
            setDiapLabel(diapSetters[i]);

            const slider = document.createElement('div');
            const that = this;
            $(slider).slider({
                min: diapRanges[i][0],
                max: diapRanges[i][1],
                values: diapSetters[i],
                step: diapSteps[i],
                range: true,
                slide: (event, ui) => {
                    if (!!ui.values) {
                        that._setDiap(diapSetters[i], ui.values[0], ui.values[1]);
                        setDiapLabel(ui.values);
                        that._renderer.rerender();
                    }
                }
            });

            const alphaPickerContainer = document.createElement('div');
            alphaPickerContainer.innerHTML = `<span>${alphaDiapNames[i]}: </span>`;
            const alphaPicker = document.createElement('div');
            const alphaLabel = document.createElement('span');
            alphaPickerContainer.appendChild(alphaLabel);
            const setAlphaLabel = (/** @type {number} */value) => {
                alphaLabel.innerText = (value / 255).toFixed(2);
            };
            setAlphaLabel(this._elementAlpha[i]);
            $(alphaPicker).slider({
                min: 0,
                max: 255,
                value: this._elementAlpha[i],
                step: 5,
                slide: (ev, ui) => {
                    that.setAlpha(i, ui.value);
                    setAlphaLabel(ui.value);
                    that._renderer.rerender();
                }
            }).appendTo(alphaPickerContainer);
            

            diapLi.appendChild(label);
            diapLi.appendChild(numLabel);
            diapLi.appendChild(slider);
            diapLi.appendChild(alphaPickerContainer);
            namedDiaps.appendChild(diapLi);
        }
        innerContainer.appendChild(namedDiaps);

        this.buildPerGroupUI();

        baseContainer.appendChild(innerContainer);
    }

    buildPerGroupUI() {
        const tr = getOrCreateTranslatorInstance();

        // per group colors & node type selector
        const nodeTypesUsed = (this.nodeTypes.length > 0);
        const stubGroupCount = this._colorPairs.length / 2 - 1;

        if (stubGroupCount > 0) {
            for (let i = 0; i < stubGroupCount; i++) {
                const settingContainer = $(`#scivi_fsgraph_group_${i}_settings`);
                if (!settingContainer.length) {
                    console.warn(`No container found for group ${i} settings!`);
                    continue;
                }
                settingContainer.empty();

                const colorPicker = document.createElement('input');
                colorPicker.type = 'color';
                colorPicker.value = ColorConverter.rgbaToHex(this._colorPairs[3 + i * 2]);
                colorPicker.addEventListener('change', (ev) => {
                    const target = /** @type {typeof colorPicker} */(ev.target);
                    this.setRgb(i, target.value);
                    this.onSettingsUpdate();
                });
                const colorPickerWrapper = $(`<div><span>${tr.apply('#node_color')}</span></div>`).append(colorPicker);
                settingContainer.append(colorPickerWrapper);

                if (nodeTypesUsed) {
                    const nodeTypeSelector = document.createElement('select');
                    Object.getOwnPropertyNames(RENDERER_MAP).forEach(nodeType => {
                        const option = document.createElement('option');
                        option.value = nodeType;
                        option.text = tr.apply(`#node_types.${nodeType}`);
                        nodeTypeSelector.appendChild(option);
                    });
                    nodeTypeSelector.value = this.nodeTypes[i];
                    nodeTypeSelector.addEventListener('change', (ev) => {
                        const target = /** @type {typeof nodeTypeSelector} */(ev.target);
                        this.onNodeTypeChange(target.value, i);
                    });
                    const nodeTypeWrapper = $(`<div><span>${tr.apply('#node_type')}</span></div>`).append(nodeTypeSelector);
                    settingContainer.append(nodeTypeWrapper);
                }
            }
        }
    }

    /**
     * 
     * @param {number} rgb
     * @param {number} alpha
     * @returns {number} rgba
     */
    static getInactiveColor(rgb, alpha) {
        const hsv = ColorConverter.rgb2hsv(rgb);
        hsv[1] = Math.floor(hsv[1] * 0.4);
        hsv[2] = 90;
        return (ColorConverter.hsv2rgb(hsv) << 8) | (alpha & 0xFF);
    }

    /**
     * 
     * @param {number} idx 
     * @param {number} value 
     */
    setAlpha(idx, value) {
        this._elementAlpha[idx] = value;
        if (!idx) {
            for (let i = 2; i < this._colorPairs.length; i += 2) {
                this._colorPairs[i] = (this._colorPairs[i] & 0xFFFFFF00) | this._elementAlpha[idx];
            }
        } else {
            this._colorPairs[0] = (this._colorPairs[0] & 0xFFFFFF00) | this._elementAlpha[idx];
        }
    }

    /**
     * 
     * @param {number} idx 
     * @param {string} hexValue 
     */
    setRgb(idx, hexValue) {
        this._colorPairs[idx * 2 + 2] = VivaStateView.getInactiveColor(ColorConverter.hexToRgb(hexValue), this._elementAlpha[0]);
        this._colorPairs[idx * 2 + 3] = ColorConverter.hexToRgba(hexValue, this._srcAlpha[0]);
    }
}

function stub() {
    ;
}

/** @type {VivaImageNodeUI?} */
let lastNodeClicked = null;

/**
 * 
 * @param {Ngraph.Graph.Graph} graph 
 * @param {VivaWebGLRenderer} renderer
 * @param {VivaImageNodeUI} nodeUI 
 * @param {boolean} toggled 
 */
function toggleRelatedWords(graph, renderer, nodeUI, toggled) {
    //выделяем текущую вершину
    nodeUI.selected = toggled;
    let realNode = nodeUI._realNode;
    // TODO: nodUI.selected, not node.selected!
    graph.forEachLinkedNode(realNode.id, (node, link) => {
        let nodeUI = renderer.graphics.getNodeUI(node.id);
        let linkUI = renderer.graphics.getLinkUI(link.id);
        //if (node.data.groupId !== 0) {
        nodeUI.showLabel = toggled;
        nodeUI.selected = toggled;
        //}
        linkUI.selected = toggled;
        if (toggled) {
            renderer.graphics.bringLinkToFront(linkUI);
        }

        return false;
    });
}

/**
 * 
 * @param {Ngraph.Graph.Graph} graph 
 * @param {VivaWebGLRenderer} renderer
 * @param {VivaImageNodeUI} nodeUI 
 * @param {boolean} toggled 
 */
function selectNodeByGroup(graph, renderer, nodeUI, toggled) {
    /** @type {Node} */
    let realNode = nodeUI.node.data;
    /*if (realNode.groupId === 0) {
        toggleRelatedWords(graph, renderer, nodeUI, toggled);
    } else {
        nodeUI.showLabel = toggled;
        nodeUI.selected = toggled;
    }*/
    //выделяем связанные вершины
    toggleRelatedWords(graph, renderer, nodeUI, toggled);
}

/**
 * 
 * @param {VivaImageNodeUI} nodeUI 
 * @param {Ngraph.Graph.Graph} graph
 * @param {VivaWebGLRenderer} renderer
 */
function selectNode2G(nodeUI, graph, renderer) {
    //если мы нажали на вершину
    if (nodeUI != null) {
        nodeUI.buildDetailedInfo();
        //если раньше было что-то выделено, то очищаем выделение
        if (lastNodeClicked) {
            selectNodeByGroup(graph, renderer, lastNodeClicked, false);
        }
        //выделяем снова
        selectNodeByGroup(graph, renderer, nodeUI, true);
        lastNodeClicked = nodeUI;
    } else {
        //если раньше что-то было выделено, то убираем выделение
        if (lastNodeClicked) {
            selectNodeByGroup(graph, renderer, lastNodeClicked, false);
            lastNodeClicked.detailedInfoHTML.innerHTML = '';
            lastNodeClicked = null;
        }
    }
    renderer.rerender();
}
