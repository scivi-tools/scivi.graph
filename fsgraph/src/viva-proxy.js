/**
 * This is an entry point for global namespace. If you want to use separate
 * modules individually - you are more than welcome to do so.
 * 
 * Последуем совету! Этот модуль - прослойка к Vivagraphjs для совместимости с
 * системой модулей ES6, а точнее - для обеспечения работы IS в VSCode
 */

import fa2f from './VivaMod/Layout/forceForceAtlas2';
import fa2 from './VivaMod/Layout/forceAtlas2';

export default {
  Utils: {
    // TODO: move to Input
    // @ts-ignore
    dragndrop: require('vivagraphjs/src/Input/dragndrop.js'),
    // @ts-ignore
    timer: require('vivagraphjs/src/Utils/timer.js'),
    // @ts-ignore
    getDimension: require('vivagraphjs/src/Utils/getDimensions.js')
  },

  Layout: {
    // @ts-ignore
    forceDirected: require('ngraph.forcelayout'),
    // @ts-ignore
    constant: require('vivagraphjs/src/Layout/constant.js'),
    forceAtlas2: fa2,
    forceAtlas2f: fa2f
  }
};
