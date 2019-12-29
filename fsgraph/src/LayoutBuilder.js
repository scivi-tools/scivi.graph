import Viva from './viva-proxy'
import merge from 'ngraph.merge'
import { getOrCreateTranslatorInstance } from '@scivi/utils'
import * as $ from 'jquery'
import 'jquery-ui/ui/widgets/slider'
import {GraphController} from "./GraphController";
import {VivaWebGLRenderer} from "./VivaWebGLRenderer";

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
     * @param {Ngraph.Graph.Graph} graph
     */
    constructor(graph) {
        this.graph = graph;
        this.settings = null;
        this.layout = null;
        this.name = null;

        /** @type {Function} */
        this._onSettingUpdatedCallback = null;
    }

    updateGraph()
    {
        /** @type Ngraph.Generic.GraphChange[] */
        let changes = [];
        this.graph.forEachNode(node => {
            changes.push({node: node, changeType: "update"});
            return false;
        });
        this.graph.forEachLink(link => {
            changes.push({link: link, changeType: "update"});
           return false;
        });
        this.graph.fire('changed', changes);
    }

    applyLayout(graphState, name)
    {
        if(this.layout !== null)
            this.layout.dispose();
        this.layout = null;

        let layout = Viva.Layout[name];
        if (typeof layout !== "function") {
            throw Error(`No layout called ${name} found!`);
        }

        /** @type {Object.<string, any>} */
        let settings = {};
        if (this.settings == null) {
            let defaultSettings = _DefaultSettings[name];
            if (defaultSettings != null) {
                // TODO: use Object.assign instead
                merge(settings, defaultSettings);
            }
        }
        else settings = this.settings;
        settings['graphState'] = graphState;
        this.name = name;
        this.settings = settings;
        this.layout = layout(this.graph, settings);
        //this.renderer.onLayoutChanged();

    }

    /**
     * @param {Function} value
     */
    set onSettingChangedCallback(value) {
        this._onSettingUpdatedCallback = value;
    }

    /*
     * 
     * @param {string} name 
     * @param {GraphController} graph
     */
    //static buildLayout(name, graph) {
        /* @type {function(any, Object.<string, any>): Ngraph.Generic.Layout} */
        /*let result = Viva.Layout[name];
        if (typeof result !== "function") {
            throw Error(`No layout called ${name} found!`);
        }

        @type {Object.<string, any>}
        let settings = {};
        let defaultSettings = _DefaultSettings[name];
        if (defaultSettings != null) {
            // TODO: use Object.assign instead
            merge(settings, defaultSettings);
        }
        settings['graphState'] = graph.currentState;
        return new LayoutBuilder(name, result(graph.graph, settings), settings);
    }*/
}

export const _ConstantLayouts = ['CircleLayout', 'PlanarianLayout'];
export const _ForceLayouts = ['forceDirected', 'forceAtlas2', 'forceAtlas2f', 'FruchtermanReingold', 'KamadaKawai'];

export const _NumRanges = {
    // from, to, step
    // ----------------- Силовые укладки -----------------
    'forceDirected' : {
        'springLength': [5, 50, 5],
        'springCoeff': [0, 0.0016, 0.0001],
        'gravity': [-5, 5, 0.1],
        'theta': [0.1, 0.9, 0.1],
        'dragCoeff': [0.1, 0.9, 0.1]
    },
    'forceAtlas2': {
        'edgeWeightInfluence': [0, 2, 0.1],
        'scalingRatio': [1, 10, 1],
        'gravity': [-5, 5, 0.1],
        'slowDown': [1, 5, 0.1],
        'theta': [0.1, 0.9, 0.1]
    },
    'forceAtlas2f': {
        'springLength': [5, 50, 5],
        'springCoeff': [0, 0.0016, 0.0001],
        'gravity': [-10, 10, 0.5],
        'theta': [0.1, 0.9, 0.1],
        'dragCoeff': [0.1, 0.9, 0.1],
        'edgeWeightInfluence': [0, 2, 0.1]
    },
    'FruchtermanReingold': {
        //область в которой укладываем
        'AreaWidth' : [100, 5000, 100],
        'AreaHeight' : [100, 5000, 100],
        'OptimalDistanceCoeff' : [0.1, 0.9, 0.1],  //Коэффициент жесткости пружин
        'Accuracy': [0.5, 25, 0.5],      //Точность укладки
        'InitialTemperatureCoeff': [5, 100, 5],   //Коэффициент начальной температуры
        'CoolingCoeff' : [0.1, 0.95, 0.05]       //Коэффициент (до 1) охлаждения графа
    },
    'KamadaKawai': {
        'SpringCoeff' : [0.1, 0.9, 0.1],    //Жесткость пружины
        'AreaWidth' : [100, 5000, 100],   //Ширина области в которой укладываем граф
        'Accuracy' : [1, 50, 1],    //Точность укладки. Чем ближе к 0 тем точнее, но дольше
    },

    // --------------- Статические укладки ----------------
    'CircleLayout':{
        'maxRadius' : [100, 5000, 100]
    },
    'HierarchicalLayout': {
        'maxRadius' : [100, 5000, 100],
        'ratioRadius': [0.1, 0.95, 0.05]
    }
};

//Стандартные настройки для укладок
export const _DefaultSettings = {
    //Силовые укладки
    'forceDirected':{
        //Коэффициенты
        'springLength': 25,     //Длина пружины в спокойном состоянии (минимальная длина ребра)
        'springCoeff': 0.0006,  //Коэффициент упругости пружины
        'gravity': -1.2,        //Ускорение свободного падения(g)
        'theta': 0.8,           //Коэффициент алгоритма Барнса Хата [0, 1]. Определяет точность алгоритма
        'dragCoeff': 0.02,      //Коэффициент силы трения [0, 1]. Чем больше, тем больше силы надо чтобы объект двигался
        'timeStep' : 20,        //Шаг по времени (dt)
        //Функции, которые можно переопределить
        'createQuadTree': undefined,//Функция построения квадро-дерева
        'createBounds' :undefined,  //Функция которая ограничивает ноды (AABB)
        'createDragForce' :undefined,//Функция определяющая силу трения
        'createSpringForce' :undefined,//Функция определяющая силу упругости
        'integrator' : undefined,        //Функция которая перемещает предметы в соответствии с силами, действующими на них
        'createBody' : undefined,    //Функция создающая тела(переводит ноду в физическое тело)
        springTransform: (link, spring) => {
            spring.weight = link.data.weight;
        }
    },

    //ныне не используется, т.к. есть forceAtlas2f
    'forceAtlas2': {
        //Коэффициенты
        'springLength': 25,     //Длина пружины в спокойном состоянии (минимальная длина ребра)
        'springCoeff': 0.0006,  //Коэффициент упругости пружины
        'gravity': -1.2,        //Ускорение свободного падения(g)
        'theta': 0.8,           //Коэффициент алгоритма Барнса Хата [0, 1]. Определяет точность алгоритма
        'dragCoeff': 0.02,      //Коэффициент силы трения [0, 1]. Чем больше, тем больше силы надо чтобы объект двигался
        'timeStep' : 20,        //Шаг по времени (dt)
        //Функции, которые можно переопределить
        'createQuadTree': null,//Функция построения квадро-дерева
        'createBounds' :null,  //Функция которая ограничивает ноды (AABB)
        'createDragForce' :null,//Функция определяющая силу трения
        'createSpringForce' :null,//Функция определяющая силу упругости
        'integrator' : null,        //Функция которая перемещает предметы в соответствии с силами, действующими на них
        'createBody' : null,    //Функция создающая тела(переводит ноду в физическое тело)
        'graphState' : null,
        'barnesHutOptimize': false,
        'linLogMode': true,
        'outboundAttractionDistribution': true,
        'adjustSizes': false,
        'strongGravityMode': false,
        'edgeWeightInfluence': 1    //Коэффиицент влиянлие веса ребра
    },

    'forceAtlas2f': {
        //Коэффициенты
        'springLength': 25,     //Длина пружины в спокойном состоянии (минимальная длина ребра)
        'springCoeff': 0.0006,  //Коэффициент упругости пружины
        'gravity': -1.2,        //Ускорение свободного падения(g)
        'theta': 0.8,           //Коэффициент алгоритма Барнса Хата [0, 1]. Определяет точность алгоритма
        'dragCoeff': 0.02,      //Коэффициент силы трения [0, 1]. Чем больше, тем больше силы надо чтобы объект двигался
        'timeStep' : 20,        //Шаг по времени (dt)
        //Функции, которые можно переопределить
        'createQuadTree': undefined,//Функция построения квадро-дерева
        'createBounds' :undefined,  //Функция которая ограничивает ноды (AABB)
        'createDragForce' :undefined,//Функция определяющая силу трения
        'createSpringForce' :undefined,//Функция определяющая силу упругости
        'integrator' : undefined,//Функция которая перемещает предметы в соответствии с силами, действующими на них (изначально используется эйлеровский интегратор)
        'createBody' : undefined,//Функция создающая тела(переводит ноду в физическое тело)
        'graphState' : undefined,
        'edgeWeightInfluence': 1,   //Коэффициент влияния веса ребра
        'outboundAttCompensation' : 1,
        'outboundAttractionDistribution' : false,
        springTransform: (link, spring) => {
            spring.weight = link.data.weight;
        }
    },

    'PlanetarianLayout': {
            //Коэффициенты
            'springLength': 1000,     //Длина пружины в спокойном состоянии (минимальная длина ребра)
            'springCoeff': 0.0002,  //Коэффициент упругости пружины
            'gravity': -0.05,        //Ускорение свободного падения(g)
            'theta': 0.5,           //Коэффициент алгоритма Барнса Хата [0, 1]. Определяет точность алгоритма
            'dragCoeff': 0.5,      //Коэффициент силы трения [0, 1]. Чем больше, тем больше силы надо чтобы объект двигался
            'timeStep' : 20,        //Шаг по времени (dt)
            //Функции, которые можно переопределить
            'createQuadTree': undefined,//Функция построения квадро-дерева
            'createBounds' :undefined,  //Функция которая ограничивает ноды (AABB)
            'createDragForce' :undefined,//Функция определяющая силу трения
            'createSpringForce' :undefined,//Функция определяющая силу упругости
            'integrator' : undefined,        //Функция которая перемещает предметы в соответствии с силами, действующими на них
            'createBody' : undefined,    //Функция создающая тела(переводит ноду в физическое тело)
            springTransform: (link, spring) => {
                spring.weight = link.data.weight;
            },
            'maxRadius' : 2000,
            'ratioRadius': 0.55
        },

    'FruchtermanReingold': {
        //область в которой укладываем
        'AreaWidth' : 3000,
        'AreaHeight' : 3000,
        'OptimalDistanceCoeff' : 0.7,  //Коэффициент жесткости пружин
        'Accuracy': 1.5,      //Точность укладки
        'InitialTemperatureCoeff': 10,   //Коэффициент начальной температуры
        'CoolingCoeff' : 0.85       //Коэффициент (до 1) охлаждения графа
    },

    'KamadaKawai': {
        'SpringCoeff' : 1,    //Жесткость пружины
        'AreaWidth' : 1000,   //Ширина области в которой укладываем граф
        'Accuracy' : 50,    //Точность укладки. Чем ближе к 0 тем точнее, но дольше
    },

    //Статические укладки
    'CircleLayout':{
        'graphState' : null,
        'maxRadius' : 1500,
    },
    'HierarchicalLayout':{
        'graphState' : null,
        'maxRadius' : 2000,
        'ratioRadius': 0.45
    }
};
