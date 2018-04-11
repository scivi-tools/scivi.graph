/**
 * This is an entry point for global namespace. If you want to use separate
 * modules individually - you are more than welcome to do so.
 * 
 * Последуем совету! Этот модуль - прослойка к Vivagraphjs для совместимости с
 * системой модулей ES6, а точнее - для обеспечения работы IS в VSCode
 */

// @ts-nocheck

import random from 'ngraph.random';

export default {
  lazyExtend: function() {
    return require('ngraph.merge').apply(this, arguments);
  },
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
  
    webgl: require('vivagraphjs/src/WebGL/webgl.js'),
    webglInputEvents: require('vivagraphjs/src/WebGL/webglInputEvents.js'),
  
    generator: function() {
      return require('ngraph.generators');
    },
  
    Input: {
      domInputManager: require('vivagraphjs/src/Input/domInputManager.js'),
      webglInputManager: require('vivagraphjs/src/Input/webglInputManager.js')
    },
  
    Utils: {
      // TODO: move to Input
      dragndrop: require('vivagraphjs/src/Input/dragndrop.js'),
      findElementPosition: require('vivagraphjs/src/Utils/findElementPosition.js'),
      timer: require('vivagraphjs/src/Utils/timer.js'),
      getDimension: require('vivagraphjs/src/Utils/getDimensions.js'),
      events: require('vivagraphjs/src/Utils/backwardCompatibleEvents.js')
    },
  
    Layout: {
      forceDirected: require('ngraph.forcelayout'),
      constant: require('vivagraphjs/src/Layout/constant.js')
    },
  
    View: {
      // TODO: Move `webglXXX` out to webgl namespace
      Texture: require('vivagraphjs/src/WebGL/texture.js'),
      // TODO: This should not be even exported
      webglAtlas: require('vivagraphjs/src/WebGL/webglAtlas.js'),
      webglImageNodeProgram: require('vivagraphjs/src/WebGL/webglImageNodeProgram.js'),
      webglLinkProgram: require('vivagraphjs/src/WebGL/webglLinkProgram.js'),
      webglNodeProgram: require('vivagraphjs/src/WebGL/webglNodeProgram.js'),
      webglLine: require('vivagraphjs/src/WebGL/webglLine.js'),
      webglSquare: require('vivagraphjs/src/WebGL/webglSquare.js'),
      webglImage: require('vivagraphjs/src/WebGL/webglImage.js'),
      webglGraphics: require('./VivaMod/webglGraphics.js'),
  
      // TODO: move to svg namespace
      svgGraphics: require('vivagraphjs/src/View/svgGraphics.js'),
  
      renderer: require('vivagraphjs/src/View/renderer.js'),
    },
  
    Rect: require('vivagraphjs/src/Utils/rect.js'),
  
    svg: require('simplesvg'),
  
    // TODO: should be camelCase
    BrowserInfo: require('vivagraphjs/src/Utils/browserInfo.js')
  }
};
