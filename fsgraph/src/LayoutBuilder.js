// TODO: перейти к классам
//@ts-check
import Viva from './viva-proxy'
import merge from 'ngraph.merge'

export class LayoutBuilder {
    /**
     * @param {string} name
     * @param {Object.<string, any>} settings 
     */
    constructor(name, settings) {
        this.settings = settings;

        //@ts-ignore
        let baseContainer = $('#settings');

        let label = document.createElement('span');
        label.textContent = 'Настройки укладки:';
        let c = document.createElement('div');
        baseContainer.append(label);
        for (let key in settings) {
            let value = settings[key];
            if (value != null) {
                let innerC = document.createElement('div');
                innerC.innerHTML += `<span>${key}: </span>`;

                const type = typeof value
                switch (type) {
                    case 'boolean':
                        let cb = document.createElement('input');
                        cb.type = 'checkbox';
                        cb.checked = value;
                        cb.onchange = function (ev) {
                            //@ts-ignore
                            settings[key] = this.checked;
                            console.log(`Setting ${key} now ${settings[key]}`);
                        };
                        innerC.appendChild(cb);
                        break;
                    case 'number':
                        let rangeEl = document.createElement('div');
                        let range = _NumRanges[name][key];
                        if (range) {
                            //@ts-ignore
                            $(rangeEl).slider({
                                min: range[0],
                                max: range[1],
                                value: value,
                                step: range[2],
                                slide: (event, ui) => {
                                    settings[key] = ui.value;
                                    console.log(`Setting ${key} now ${settings[key]}`);
                                }
                            });
                        } else {
                            rangeEl.innerText = `${value} (unchangeable)`;
                        }
                        innerC.appendChild(rangeEl);
                        break;
                    default:
                        console.log(`Skipping unsupported layout setting ${key} of type ${type}`);
                }
                c.appendChild(innerC);
            } else {
                console.log(`Skipping null-valued layout setting ${key}`);
            }
        }
        baseContainer.append(c);
    }

    static buildLayout(/** @type {string} */name, graph) {
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

        let layout = result(graph, settings);
        // TODO: висячей ссылки быть не должно!
        new LayoutBuilder(name, settings);

        return layout;
    }
}

const _NumRanges = {
    'forceAtlas2': {
        // from, to, step
        'edgeWeightInfluence': [0, 1, 0.1],
        'scalingRatio': [1, 10, 1],
        'gravity': [0, 2, 0.1],
        'slowDown': [1, 5, 0.1],
        'barnesHutTheta': [0.1, 0.9, 0.1]
    }
};

const _DefaultSettings = {
    'forceAtlas2': {
        'barnesHutOptimize' : false,
        'linLogMode' : true,
        'outboundAttractionDistribution' : true
    }
};
