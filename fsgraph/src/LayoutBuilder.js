import Viva from './viva-proxy'
import merge from 'ngraph.merge'
import { getOrCreateTranslatorInstance } from '@scivi/utils'
import * as $ from 'jquery'
import 'jquery-ui/ui/widgets/slider'
import {GraphController} from "./GraphController";

//Создает радио кнопку как элемент списка span с текстом
function createRadioElement(id, name, checked, label) {
    let span = document.createElement('span');
    let l = document.createTextNode(label);
    let radioButton = document.createElement('input');
    radioButton.setAttribute('type', 'radio');
    radioButton.setAttribute('id', id);
    radioButton.setAttribute('name', name);
    if (checked)
            radioButton.setAttribute('checked', 'checked');
    span.appendChild(radioButton);
    span.appendChild(l);
    return span;
}

export class LayoutBuilder {
    /**
     * @param {string} name
     * @param {Ngraph.Generic.Layout} layout
     * @param {Object.<string, any>} settings 
     */
    constructor(name, layout, settings) {
        this.settings = settings;
        this.layout = layout;
        this.name = name;

        /** @type {Function} */
        this._onSettingUpdatedCallback = null;
    }

    //Функция построения интерфейса настройки укладки графа
    buildUI() {
        const tr = getOrCreateTranslatorInstance();
        const baseContainer = $('#scivi_fsgraph_settings_layout');
        //создаем список радио кнопок с различными вариантами укладок графа
        const layout_list = document.createElement('div');
        layout_list.className = 'layout_list';
        //создаем радио кнопку для круговой укладки
        let rbCircleLayout = createRadioElement('rbCircleLayout', 'CircleLayout', true, tr.apply(`#graph_circle_layout`));
        layout_list.appendChild(rbCircleLayout);
        //создаем радио кнопку для ForceAtlas2
        let rbForceAtlas = createRadioElement('rbForceAtlas', 'ForceAtlas', false, tr.apply(`#graph_force_atlas_layout`));
        layout_list.appendChild(rbForceAtlas);
        


        /*for (let key in this.settings) {
            let value = this.settings[key];
            if (value != null) {
                let skipme = false;
                const innerC = document.createElement('li');
                innerC.innerHTML += `<span>${tr.apply(`#layout_settigns.#${key}`)}: </span>`;

                const type = typeof value
                switch (type) {
                    case 'boolean':
                        let cb = document.createElement('input');
                        cb.type = 'checkbox';
                        cb.checked = value;
                        cb.onchange = (ev) => {
                            this.settings[key] = cb.checked;
                            if (!!this._onSettingUpdatedCallback) {
                                this._onSettingUpdatedCallback();
                            }
                        };
                        innerC.appendChild(cb);
                        break;

                    case 'number':
                        if (_NumRanges[this.name] && _NumRanges[this.name][key]) {
                            const valueLabel = document.createElement('span');
                            valueLabel.innerText = value;

                            let rangeEl = document.createElement('div');
                            let range = _NumRanges[this.name][key];
                            $(rangeEl).slider({
                                min: range[0],
                                max: range[1],
                                value: value,
                                step: range[2],
                                slide: (event, ui) => {
                                    this.settings[key] = ui.value;
                                    valueLabel.innerText = ui.value.toString();
                                    if (!!this._onSettingUpdatedCallback) {
                                        this._onSettingUpdatedCallback();
                                    }
                                }
                            });
                            innerC.appendChild(valueLabel);
                            innerC.appendChild(rangeEl);
                        } else {
                            skipme = true;
                        }
                        break;

                    default:
                        console.log(`Skipping unsupported layout setting ${key} of type ${type}`);
                        skipme = true;
                        break;
                }
                if (!skipme) {
                    c.appendChild(innerC);
                }
            } else {
                console.log(`Skipping null-valued layout setting ${key}`);
            }
        }*/
        baseContainer.append(layout_list);
    }

    /**
     * @param {Function} value
     */
    set onSetiingChangedCallback(value) {
        this._onSettingUpdatedCallback = value;
    }

    /**
     * 
     * @param {string} name 
     * @param {GraphController} graph
     */
    static buildLayout(name, graph) {
        /** @type {function(any, Object.<string, any>): Ngraph.Generic.Layout} */
        let result = Viva.Layout[name];
        if (typeof result !== "function") {
            throw Error(`No layout called ${name} found!`);
        }
    
        // TODO: нужен словарь стандартных настроек для известных укладок
        /** @type {Object.<string, any>} */
        let settings = {};
        let defaultSettings = _DefaultSettings[name];
        if (defaultSettings != null) {
            // TODO: use Object.assign instead
            merge(settings, defaultSettings);
        }
        settings['graphState'] = graph.currentState;
        return new LayoutBuilder(name, result(graph.graph, settings), settings);
    }
}

const _NumRanges = {
    'forceAtlas2': {
        // from, to, step
        'edgeWeightInfluence': [0, 2, 0.1],
        'scalingRatio': [1, 10, 1],
        'gravity': [0, 2, 0.1],
        'slowDown': [1, 5, 0.1],
        'barnesHutTheta': [0.1, 0.9, 0.1]
    },
    'forceAtlas2f': {
        'edgeWeightInfluence': [0, 2, 0.1],
        'springLength': [5, 50, 5],
        'springCoeff': [0, 0.0016, 0.0001]
    }
};

const _DefaultSettings = {
    'forceAtlas2': {
        'graphState' : null,
        'barnesHutOptimize': false,
        'linLogMode': true,
        'outboundAttractionDistribution': true,
        'adjustSizes': false,
        'strongGravityMode': false,
        'edgeWeightInfluence': 1
    },
    'forceAtlas2f': {
        'graphState' : null,
        'springLength': 25,
        'springCoeff': 0.0006,
        'edgeWeightInfluence': 1,
        springTransform: (link, spring) => {
            spring.weight = link.data.weight;
        }
    },
    'forceDirected': {
        'graphState' : null,
        springTransform: (link, spring) => {
            spring.weight = link.data.weight;
        }
    },
    'CircleLayout':{
        'graphState' : null,
        'maxRadius' : 1500,
    }
};
