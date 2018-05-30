/**
 * This is an entry point for global namespace. If you want to use separate
 * modules individually - you are more than welcome to do so.
 * 
 * Последуем совету! Этот модуль - прослойка к Vivagraphjs для совместимости с
 * системой модулей ES6, а точнее - для обеспечения работы IS в VSCode
 */

// @ts-nocheck

import random from 'ngraph.random';

import fa2f from './VivaMod/forceForceAtlas2';

export default {
  randomIterator: function() {
    return random.randomIterator.apply(random, arguments);
  },
  random: function() {
    return random.random.apply(random, arguments);
  },
  events: require('ngraph.events'),
  Graph: {
    version: require('vivagraphjs/src/version.js'),
    graph: require('ngraph.graph'),
  
    serializer: function() {
      return {
        loadFromJSON: require('ngraph.fromjson'),
        storeToJSON: require('ngraph.tojson')
      };
    },
  
    centrality: require('vivagraphjs/src/Algorithms/centrality.js'),
    operations: require('vivagraphjs/src/Algorithms/operations.js'),
  
    geom: function() {
      return {
        intersect: require('gintersect'),
        intersectRect: require('vivagraphjs/src/Utils/intersectRect.js')
      };
    },
    
    Utils: {
      // TODO: move to Input
      dragndrop: require('vivagraphjs/src/Input/dragndrop.js'),
      timer: require('vivagraphjs/src/Utils/timer.js'),
      getDimension: require('vivagraphjs/src/Utils/getDimensions.js')
    },
  
    Layout: {
      forceDirected: require('ngraph.forcelayout'),
      constant: require('vivagraphjs/src/Layout/constant.js'),
      forceAtlas2: require('./VivaMod/forceAtlas2.js'),
      forceAtlas2f: fa2f
    },
  
    Rect: require('vivagraphjs/src/Utils/rect.js'),
  
    // TODO: should be camelCase
    BrowserInfo: require('vivagraphjs/src/Utils/browserInfo.js')
  }
};
