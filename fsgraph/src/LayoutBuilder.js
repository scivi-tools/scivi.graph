//@ts-check
import Viva from './viva-proxy'
import * as merge from 'ngraph.merge'
import { VivaWebGLRenderer } from './VivaWebGLRenderer'
import { getOrCreateTranslatorInstance } from './Misc/Translator'
import * as $ from 'jquery'
import 'jquery-ui/ui/widgets/slider'
/// <reference path="./@types/ngraph.d.ts" />

export class LayoutBuilder {
    /**
     * @param {string} name
     * @param {NgraphGeneric.Layout} layout
     * @param {Object.<string, any>} settings 
     */
    constructor(name, layout, settings) {
        this.settings = settings;
        this.layout = layout;
        this.name = name;
    }

    buildUI(/** @type {VivaWebGLRenderer} */renderer) {
        const tr = getOrCreateTranslatorInstance();
        const baseContainer = $('#scivi_fsgraph_settings_layout');
        
        const c = document.createElement('ul');
        c.classList.add('pseudo-list');
        for (let key in this.settings) {
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
                            renderer.kick();
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
                                    renderer.kick();
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
        }
        baseContainer.append(c);
    }

    /**
     * 
     * @param {string} name 
     * @param {NgraphGraph.Graph} graph 
     */
    static buildLayout(name, graph) {
        /** @type {function(any, Object.<string, any>)} */
        let result = Viva.Graph.Layout[name];
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

        let layout = new LayoutBuilder(name, result(graph, settings), settings);
        return layout;
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
        'barnesHutOptimize': false,
        'linLogMode': true,
        'outboundAttractionDistribution': true,
        'adjustSizes': false,
        'strongGravityMode': false,
        'edgeWeightInfluence': 1
    },
    'forceAtlas2f': {
        'springLength': 25,
        'springCoeff': 0.0006,
        'edgeWeightInfluence': 1,
        springTransform: (link, spring) => {
            spring.weight = link.data.weight;
        }
    },
    'forceDirected': {
        springTransform: (link, spring) => {
            spring.weight = link.data.weight;
        }
    }
};
