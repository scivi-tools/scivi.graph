/**
 * This is an entry point for global namespace. If you want to use separate
 * modules individually - you are more than welcome to do so.
 * 
 * Последуем совету! Этот модуль - прослойка к Vivagraphjs для совместимости с
 * системой модулей ES6, а точнее - для обеспечения работы IS в VSCode
 */

import forceAtlas2f_createLayout from './VivaMod/Layout/forceAtlas2f';
import CircleLayout_createLayout from './VivaMod/Layout/CircleLayout';
import HierarchicalLayout_createLayout from './VivaMod/Layout/HierarchicalLayout';
//import fa2 from './VivaMod/Layout/forceAtlas2';
import KamadaKawai_createLayout from './VivaMod/Layout/KamadaKawai';
import FruchtermanReingold_createLayout from './VivaMod/Layout/FruchtermanReingold';
import constant from './VivaMod/ConstantLayout';

export default {
  Utils: {
    // TODO: move to Input
    // @ts-ignore
    dragndrop: require('vivagraphjs/src/Input/dragndrop.js'),
    // @ts-ignore
    /** @type {VivaGeneric.TimerBuilder} */
    timer: require('vivagraphjs/src/Utils/timer.js'),
    // @ts-ignore
    getDimension: require('vivagraphjs/src/Utils/getDimensions.js')
  },

  Layout: {
    // @ts-ignore
    forceDirected: require('ngraph.forcelayout'),
    constant: constant,
    //forceAtlas2: fa2,
    forceAtlas2f: forceAtlas2f_createLayout,
    CircleLayout: CircleLayout_createLayout,
    HierarchicalLayout: HierarchicalLayout_createLayout,
    KamadaKawai: KamadaKawai_createLayout,
    FruchtermanReingold: FruchtermanReingold_createLayout
  }
};
