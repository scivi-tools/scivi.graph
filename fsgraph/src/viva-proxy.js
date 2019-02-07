/**
 * This is an entry point for global namespace. If you want to use separate
 * modules individually - you are more than welcome to do so.
 * 
 * Последуем совету! Этот модуль - прослойка к Vivagraphjs для совместимости с
 * системой модулей ES6, а точнее - для обеспечения работы IS в VSCode
 */

// @ts-nocheck

import fa2f from './VivaMod/Layout/forceForceAtlas2';

export default {
  Graph: {
    graph: require('ngraph.graph'),
    
    Utils: {
      // TODO: move to Input
      dragndrop: require('vivagraphjs/src/Input/dragndrop.js'),
      timer: require('vivagraphjs/src/Utils/timer.js'),
      getDimension: require('vivagraphjs/src/Utils/getDimensions.js')
    },
  
    Layout: {
      forceDirected: require('ngraph.forcelayout'),
      constant: require('vivagraphjs/src/Layout/constant.js'),
      forceAtlas2: require('./VivaMod/Layout/forceAtlas2'),
      forceAtlas2f: fa2f
    }
  }
};
