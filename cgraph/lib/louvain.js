(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Louvain = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Louvain = {
    detectClusters: function (data)
    {
        var create = require("ngraph.graph");
        var detect = require("ngraph.louvain");
        var graph = create();

        data.nodes.forEach(function (node) {
            graph.addNode(node.id, node);
        });
        data.edges.forEach(function (edge) {
            graph.addLink(edge.source.id, edge.target.id);
        });

        var clusters = detect(graph);
        var indices = {};
        var index = 0;

        graph.forEachNode(function (node) {
            var classID = clusters.getClass(node.id);
            var groupID = indices[classID];
            if (groupID === undefined) {
                groupID = index++;
                indices[classID] = groupID;
            }
            node.data.groupID = groupID;
        });
    }
};

module.exports = Louvain;

},{"ngraph.graph":3,"ngraph.louvain":4}],2:[function(require,module,exports){
module.exports = function(subject) {
  validateSubject(subject);

  var eventsStorage = createEventsStorage(subject);
  subject.on = eventsStorage.on;
  subject.off = eventsStorage.off;
  subject.fire = eventsStorage.fire;
  return subject;
};

function createEventsStorage(subject) {
  // Store all event listeners to this hash. Key is event name, value is array
  // of callback records.
  //
  // A callback record consists of callback function and its optional context:
  // { 'eventName' => [{callback: function, ctx: object}] }
  var registeredEvents = Object.create(null);

  return {
    on: function (eventName, callback, ctx) {
      if (typeof callback !== 'function') {
        throw new Error('callback is expected to be a function');
      }
      var handlers = registeredEvents[eventName];
      if (!handlers) {
        handlers = registeredEvents[eventName] = [];
      }
      handlers.push({callback: callback, ctx: ctx});

      return subject;
    },

    off: function (eventName, callback) {
      var wantToRemoveAll = (typeof eventName === 'undefined');
      if (wantToRemoveAll) {
        // Killing old events storage should be enough in this case:
        registeredEvents = Object.create(null);
        return subject;
      }

      if (registeredEvents[eventName]) {
        var deleteAllCallbacksForEvent = (typeof callback !== 'function');
        if (deleteAllCallbacksForEvent) {
          delete registeredEvents[eventName];
        } else {
          var callbacks = registeredEvents[eventName];
          for (var i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].callback === callback) {
              callbacks.splice(i, 1);
            }
          }
        }
      }

      return subject;
    },

    fire: function (eventName) {
      var callbacks = registeredEvents[eventName];
      if (!callbacks) {
        return subject;
      }

      var fireArguments;
      if (arguments.length > 1) {
        fireArguments = Array.prototype.splice.call(arguments, 1);
      }
      for(var i = 0; i < callbacks.length; ++i) {
        var callbackInfo = callbacks[i];
        callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
      }

      return subject;
    }
  };
}

function validateSubject(subject) {
  if (!subject) {
    throw new Error('Eventify cannot use falsy object as events subject');
  }
  var reservedWords = ['on', 'fire', 'off'];
  for (var i = 0; i < reservedWords.length; ++i) {
    if (subject.hasOwnProperty(reservedWords[i])) {
      throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
    }
  }
}

},{}],3:[function(require,module,exports){
/**
 * @fileOverview Contains definition of the core graph object.
 */

// TODO: need to change storage layer:
// 1. Be able to get all nodes O(1)
// 2. Be able to get number of links O(1)

/**
 * @example
 *  var graph = require('ngraph.graph')();
 *  graph.addNode(1);     // graph has one node.
 *  graph.addLink(2, 3);  // now graph contains three nodes and one link.
 *
 */
module.exports = createGraph;

var eventify = require('ngraph.events');

/**
 * Creates a new graph
 */
function createGraph(options) {
  // Graph structure is maintained as dictionary of nodes
  // and array of links. Each node has 'links' property which
  // hold all links related to that node. And general links
  // array is used to speed up all links enumeration. This is inefficient
  // in terms of memory, but simplifies coding.
  options = options || {};
  if ('uniqueLinkId' in options) {
    console.warn(
      'ngraph.graph: Starting from version 0.14 `uniqueLinkId` is deprecated.\n' +
      'Use `multigraph` option instead\n',
      '\n',
      'Note: there is also change in default behavior: From now own each graph\n'+
      'is considered to be not a multigraph by default (each edge is unique).'
    );

    options.multigraph = options.uniqueLinkId;
  }

  // Dear reader, the non-multigraphs do not guarantee that there is only
  // one link for a given pair of node. When this option is set to false
  // we can save some memory and CPU (18% faster for non-multigraph);
  if (options.multigraph === undefined) options.multigraph = false;

  var nodes = typeof Object.create === 'function' ? Object.create(null) : {},
    links = [],
    // Hash of multi-edges. Used to track ids of edges between same nodes
    multiEdges = {},
    nodesCount = 0,
    suspendEvents = 0,

    forEachNode = createNodeIterator(),
    createLink = options.multigraph ? createUniqueLink : createSingleLink,

    // Our graph API provides means to listen to graph changes. Users can subscribe
    // to be notified about changes in the graph by using `on` method. However
    // in some cases they don't use it. To avoid unnecessary memory consumption
    // we will not record graph changes until we have at least one subscriber.
    // Code below supports this optimization.
    //
    // Accumulates all changes made during graph updates.
    // Each change element contains:
    //  changeType - one of the strings: 'add', 'remove' or 'update';
    //  node - if change is related to node this property is set to changed graph's node;
    //  link - if change is related to link this property is set to changed graph's link;
    changes = [],
    recordLinkChange = noop,
    recordNodeChange = noop,
    enterModification = noop,
    exitModification = noop;

  // this is our public API:
  var graphPart = {
    /**
     * Adds node to the graph. If node with given id already exists in the graph
     * its data is extended with whatever comes in 'data' argument.
     *
     * @param nodeId the node's identifier. A string or number is preferred.
     * @param [data] additional data for the node being added. If node already
     *   exists its data object is augmented with the new one.
     *
     * @return {node} The newly added node or node with given id if it already exists.
     */
    addNode: addNode,

    /**
     * Adds a link to the graph. The function always create a new
     * link between two nodes. If one of the nodes does not exists
     * a new node is created.
     *
     * @param fromId link start node id;
     * @param toId link end node id;
     * @param [data] additional data to be set on the new link;
     *
     * @return {link} The newly created link
     */
    addLink: addLink,

    /**
     * Removes link from the graph. If link does not exist does nothing.
     *
     * @param link - object returned by addLink() or getLinks() methods.
     *
     * @returns true if link was removed; false otherwise.
     */
    removeLink: removeLink,

    /**
     * Removes node with given id from the graph. If node does not exist in the graph
     * does nothing.
     *
     * @param nodeId node's identifier passed to addNode() function.
     *
     * @returns true if node was removed; false otherwise.
     */
    removeNode: removeNode,

    /**
     * Gets node with given identifier. If node does not exist undefined value is returned.
     *
     * @param nodeId requested node identifier;
     *
     * @return {node} in with requested identifier or undefined if no such node exists.
     */
    getNode: getNode,

    /**
     * Gets number of nodes in this graph.
     *
     * @return number of nodes in the graph.
     */
    getNodesCount: function () {
      return nodesCount;
    },

    /**
     * Gets total number of links in the graph.
     */
    getLinksCount: function () {
      return links.length;
    },

    /**
     * Gets all links (inbound and outbound) from the node with given id.
     * If node with given id is not found null is returned.
     *
     * @param nodeId requested node identifier.
     *
     * @return Array of links from and to requested node if such node exists;
     *   otherwise null is returned.
     */
    getLinks: getLinks,

    /**
     * Invokes callback on each node of the graph.
     *
     * @param {Function(node)} callback Function to be invoked. The function
     *   is passed one argument: visited node.
     */
    forEachNode: forEachNode,

    /**
     * Invokes callback on every linked (adjacent) node to the given one.
     *
     * @param nodeId Identifier of the requested node.
     * @param {Function(node, link)} callback Function to be called on all linked nodes.
     *   The function is passed two parameters: adjacent node and link object itself.
     * @param oriented if true graph treated as oriented.
     */
    forEachLinkedNode: forEachLinkedNode,

    /**
     * Enumerates all links in the graph
     *
     * @param {Function(link)} callback Function to be called on all links in the graph.
     *   The function is passed one parameter: graph's link object.
     *
     * Link object contains at least the following fields:
     *  fromId - node id where link starts;
     *  toId - node id where link ends,
     *  data - additional data passed to graph.addLink() method.
     */
    forEachLink: forEachLink,

    /**
     * Suspend all notifications about graph changes until
     * endUpdate is called.
     */
    beginUpdate: enterModification,

    /**
     * Resumes all notifications about graph changes and fires
     * graph 'changed' event in case there are any pending changes.
     */
    endUpdate: exitModification,

    /**
     * Removes all nodes and links from the graph.
     */
    clear: clear,

    /**
     * Detects whether there is a link between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     * NOTE: this function is synonim for getLink()
     *
     * @returns link if there is one. null otherwise.
     */
    hasLink: getLink,

    /**
     * Detects whether there is a node with given id
     * 
     * Operation complexity is O(1)
     * NOTE: this function is synonim for getNode()
     *
     * @returns node if there is one; Falsy value otherwise.
     */
    hasNode: getNode,

    /**
     * Gets an edge between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     *
     * @param {string} fromId link start identifier
     * @param {string} toId link end identifier
     *
     * @returns link if there is one. null otherwise.
     */
    getLink: getLink
  };

  // this will add `on()` and `fire()` methods.
  eventify(graphPart);

  monitorSubscribers();

  return graphPart;

  function monitorSubscribers() {
    var realOn = graphPart.on;

    // replace real `on` with our temporary on, which will trigger change
    // modification monitoring:
    graphPart.on = on;

    function on() {
      // now it's time to start tracking stuff:
      graphPart.beginUpdate = enterModification = enterModificationReal;
      graphPart.endUpdate = exitModification = exitModificationReal;
      recordLinkChange = recordLinkChangeReal;
      recordNodeChange = recordNodeChangeReal;

      // this will replace current `on` method with real pub/sub from `eventify`.
      graphPart.on = realOn;
      // delegate to real `on` handler:
      return realOn.apply(graphPart, arguments);
    }
  }

  function recordLinkChangeReal(link, changeType) {
    changes.push({
      link: link,
      changeType: changeType
    });
  }

  function recordNodeChangeReal(node, changeType) {
    changes.push({
      node: node,
      changeType: changeType
    });
  }

  function addNode(nodeId, data) {
    if (nodeId === undefined) {
      throw new Error('Invalid node identifier');
    }

    enterModification();

    var node = getNode(nodeId);
    if (!node) {
      node = new Node(nodeId, data);
      nodesCount++;
      recordNodeChange(node, 'add');
    } else {
      node.data = data;
      recordNodeChange(node, 'update');
    }

    nodes[nodeId] = node;

    exitModification();
    return node;
  }

  function getNode(nodeId) {
    return nodes[nodeId];
  }

  function removeNode(nodeId) {
    var node = getNode(nodeId);
    if (!node) {
      return false;
    }

    enterModification();

    var prevLinks = node.links;
    if (prevLinks) {
      node.links = null;
      for(var i = 0; i < prevLinks.length; ++i) {
        removeLink(prevLinks[i]);
      }
    }

    delete nodes[nodeId];
    nodesCount--;

    recordNodeChange(node, 'remove');

    exitModification();

    return true;
  }


  function addLink(fromId, toId, data) {
    enterModification();

    var fromNode = getNode(fromId) || addNode(fromId);
    var toNode = getNode(toId) || addNode(toId);

    var link = createLink(fromId, toId, data);

    links.push(link);

    // TODO: this is not cool. On large graphs potentially would consume more memory.
    addLinkToNode(fromNode, link);
    if (fromId !== toId) {
      // make sure we are not duplicating links for self-loops
      addLinkToNode(toNode, link);
    }

    recordLinkChange(link, 'add');

    exitModification();

    return link;
  }

  function createSingleLink(fromId, toId, data) {
    var linkId = makeLinkId(fromId, toId);
    return new Link(fromId, toId, data, linkId);
  }

  function createUniqueLink(fromId, toId, data) {
    // TODO: Get rid of this method.
    var linkId = makeLinkId(fromId, toId);
    var isMultiEdge = multiEdges.hasOwnProperty(linkId);
    if (isMultiEdge || getLink(fromId, toId)) {
      if (!isMultiEdge) {
        multiEdges[linkId] = 0;
      }
      var suffix = '@' + (++multiEdges[linkId]);
      linkId = makeLinkId(fromId + suffix, toId + suffix);
    }

    return new Link(fromId, toId, data, linkId);
  }

  function getLinks(nodeId) {
    var node = getNode(nodeId);
    return node ? node.links : null;
  }

  function removeLink(link) {
    if (!link) {
      return false;
    }
    var idx = indexOfElementInArray(link, links);
    if (idx < 0) {
      return false;
    }

    enterModification();

    links.splice(idx, 1);

    var fromNode = getNode(link.fromId);
    var toNode = getNode(link.toId);

    if (fromNode) {
      idx = indexOfElementInArray(link, fromNode.links);
      if (idx >= 0) {
        fromNode.links.splice(idx, 1);
      }
    }

    if (toNode) {
      idx = indexOfElementInArray(link, toNode.links);
      if (idx >= 0) {
        toNode.links.splice(idx, 1);
      }
    }

    recordLinkChange(link, 'remove');

    exitModification();

    return true;
  }

  function getLink(fromNodeId, toNodeId) {
    // TODO: Use sorted links to speed this up
    var node = getNode(fromNodeId),
      i;
    if (!node || !node.links) {
      return null;
    }

    for (i = 0; i < node.links.length; ++i) {
      var link = node.links[i];
      if (link.fromId === fromNodeId && link.toId === toNodeId) {
        return link;
      }
    }

    return null; // no link.
  }

  function clear() {
    enterModification();
    forEachNode(function(node) {
      removeNode(node.id);
    });
    exitModification();
  }

  function forEachLink(callback) {
    var i, length;
    if (typeof callback === 'function') {
      for (i = 0, length = links.length; i < length; ++i) {
        callback(links[i]);
      }
    }
  }

  function forEachLinkedNode(nodeId, callback, oriented) {
    var node = getNode(nodeId);

    if (node && node.links && typeof callback === 'function') {
      if (oriented) {
        return forEachOrientedLink(node.links, nodeId, callback);
      } else {
        return forEachNonOrientedLink(node.links, nodeId, callback);
      }
    }
  }

  function forEachNonOrientedLink(links, nodeId, callback) {
    var quitFast;
    for (var i = 0; i < links.length; ++i) {
      var link = links[i];
      var linkedNodeId = link.fromId === nodeId ? link.toId : link.fromId;

      quitFast = callback(nodes[linkedNodeId], link);
      if (quitFast) {
        return true; // Client does not need more iterations. Break now.
      }
    }
  }

  function forEachOrientedLink(links, nodeId, callback) {
    var quitFast;
    for (var i = 0; i < links.length; ++i) {
      var link = links[i];
      if (link.fromId === nodeId) {
        quitFast = callback(nodes[link.toId], link);
        if (quitFast) {
          return true; // Client does not need more iterations. Break now.
        }
      }
    }
  }

  // we will not fire anything until users of this library explicitly call `on()`
  // method.
  function noop() {}

  // Enter, Exit modification allows bulk graph updates without firing events.
  function enterModificationReal() {
    suspendEvents += 1;
  }

  function exitModificationReal() {
    suspendEvents -= 1;
    if (suspendEvents === 0 && changes.length > 0) {
      graphPart.fire('changed', changes);
      changes.length = 0;
    }
  }

  function createNodeIterator() {
    // Object.keys iterator is 1.3x faster than `for in` loop.
    // See `https://github.com/anvaka/ngraph.graph/tree/bench-for-in-vs-obj-keys`
    // branch for perf test
    return Object.keys ? objectKeysIterator : forInIterator;
  }

  function objectKeysIterator(callback) {
    if (typeof callback !== 'function') {
      return;
    }

    var keys = Object.keys(nodes);
    for (var i = 0; i < keys.length; ++i) {
      if (callback(nodes[keys[i]])) {
        return true; // client doesn't want to proceed. Return.
      }
    }
  }

  function forInIterator(callback) {
    if (typeof callback !== 'function') {
      return;
    }
    var node;

    for (node in nodes) {
      if (callback(nodes[node])) {
        return true; // client doesn't want to proceed. Return.
      }
    }
  }
}

// need this for old browsers. Should this be a separate module?
function indexOfElementInArray(element, array) {
  if (!array) return -1;

  if (array.indexOf) {
    return array.indexOf(element);
  }

  var len = array.length,
    i;

  for (i = 0; i < len; i += 1) {
    if (array[i] === element) {
      return i;
    }
  }

  return -1;
}

/**
 * Internal structure to represent node;
 */
function Node(id, data) {
  this.id = id;
  this.links = null;
  this.data = data;
}

function addLinkToNode(node, link) {
  if (node.links) {
    node.links.push(link);
  } else {
    node.links = [link];
  }
}

/**
 * Internal structure to represent links;
 */
function Link(fromId, toId, data, id) {
  this.fromId = fromId;
  this.toId = toId;
  this.data = data;
  this.id = id;
}

function hashCode(str) {
  var hash = 0, i, chr, len;
  if (str.length == 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function makeLinkId(fromId, toId) {
  return fromId.toString() + '👉 ' + toId.toString();
}

},{"ngraph.events":2}],4:[function(require,module,exports){
var createCommunityGraph = require('./lib/createCommunityGraph.js');
var createCommunity = require('./lib/createCommunity.js');

module.exports = modularity;

function modularity(ngraph) {
  var graph = createCommunityGraph(ngraph);
  var community = createCommunity(graph);
  var originalModularity = community.modularity();

  var nodesMoved = community.optimizeModularity();
  var newModularity = community.modularity();

  return {
    canCoarse: canCoarse,
    originalModularity: originalModularity,
    newModularity: newModularity,
    getClass: getClass
  };

  function canCoarse() {
    // If there was movement last turn - we can coarse graph further.
    return nodesMoved;
  }

  function getClass(nodeId) {
    var node = graph.getNodeIdFromNgraph(nodeId);
    return community.getClass(node);
  }
}



},{"./lib/createCommunity.js":5,"./lib/createCommunityGraph.js":6}],5:[function(require,module,exports){
var nrandom = require('ngraph.random');

var seededRandom = nrandom.random(42);
var randomIterator = nrandom.randomIterator;

module.exports = createCommunity;

function createCommunity(graph) {
  var graphWeight = graph.weight;
  var nodeCount = graph.nodeCount;

  var totalLinksWeight = new Float32Array(nodeCount);
  var internalLinksWeight = new Float32Array(nodeCount);
  var nodeToCommunity = new Uint32Array(nodeCount);

  for (var i = 0; i < nodeCount; ++i) {
    // each node belongs to it's own community at the start
    nodeToCommunity[i] = i;
    totalLinksWeight[i] = graph.getWeightedDegree(i);
    internalLinksWeight[i] = graph.getSelfLoopsCount(i);
  }

  return {
    /**
     * compute modularity of the current community
     */
    modularity: modularity,

    /**
     * Attempts to optimize communities of the graph. Returns true if any nodes
     * were moved; False otherwise.
     */
    optimizeModularity: optimizeModularity,

    /**
     * Given a node id returns its "class" (a cluster id);
     */
    getClass: getClass
  }

  function getClass(id) {
    return nodeToCommunity[id];
  }

  function optimizeModularity() {
    var epsilon = 0.000001;

    var iterator = getRandomNodeIdIterator();
    var newModularity = modularity();
    var currentModularity = newModularity;
    var modularityImproved = false;

    do {
      var movesCount = 0;
      currentModularity = newModularity;
      for (var i = 0; i < iterator.length; ++i) {
        var node = iterator[i];
        var nodeCommunity = nodeToCommunity[node];

        var neigboughingCommunities = getNeighbouringCommunities(node);

        var sharedLinksWeight = neigboughingCommunities.get(nodeCommunity);
        removeFromCommunity(node, nodeCommunity, sharedLinksWeight);

        var weightedDegree = graph.getWeightedDegree(node);
        var bestCommunity = nodeCommunity;
        var bestGain = 0;

        neigboughingCommunities.forEach(function(sharedWeight, communityId) {
          var gain = getModularityGain(node, sharedWeight, communityId, weightedDegree);
          if (gain <= bestGain) return;

          bestCommunity = communityId
          bestGain = gain;
        });

        var bestSharedWeight = neigboughingCommunities.get(bestCommunity);
        insertIntoCommunity(node, bestCommunity, bestSharedWeight);

        if (bestCommunity !== nodeCommunity) movesCount += 1;
      }

      newModularity = modularity();
      if (movesCount > 0) modularityImproved = true;
    } while (movesCount > 0 && newModularity - currentModularity > epsilon);

    return modularityImproved;
  }

  function getNeighbouringCommunities(nodeId) {
    // map from community id to total links weight between this node and that community
    var map = new Map();
    map.set(nodeToCommunity[nodeId], 0);

    graph.forEachNeigbour(nodeId, function(otherNodeId, edgeWeight) {
      var otherCommunity = nodeToCommunity[otherNodeId];
      var currentValue = map.get(otherCommunity) || 0;
      map.set(otherCommunity, currentValue + edgeWeight);
    });

    return map;
  }

  function getModularityGain(nodeId, sharedWeight, communityId, degree) {
    var totalLinksWeightInThisCommunity = totalLinksWeight[communityId];

    return sharedWeight - totalLinksWeightInThisCommunity * degree/graphWeight;
  }

  function removeFromCommunity(nodeId, communityId, sharedLinksWeight) {
    totalLinksWeight[communityId] -= graph.getWeightedDegree(nodeId);
    internalLinksWeight[communityId] -= 2 * sharedLinksWeight + graph.getSelfLoopsCount(nodeId);
    nodeToCommunity[nodeId] = -1;
  }

  function insertIntoCommunity(nodeId, communityId, sharedLinksWeight) {
    totalLinksWeight[communityId] += graph.getWeightedDegree(nodeId);
    internalLinksWeight[communityId] += 2 * sharedLinksWeight + graph.getSelfLoopsCount(nodeId);
    nodeToCommunity[nodeId] = communityId;
  }

  function modularity() {
    var result = 0;

    for (var communityId = 0; communityId < nodeCount; ++communityId) {
      if (totalLinksWeight[communityId] > 0) {
        var dw = totalLinksWeight[communityId] / graphWeight;
        result += internalLinksWeight[communityId] / graphWeight - dw * dw;
      }
    }

    return result;
  }

  function getRandomNodeIdIterator() {
      var iterator = [];

      for (var i = 0; i < nodeCount; ++i) {
        iterator[i] = i;
      }

      randomIterator(iterator, seededRandom).shuffle();

      return iterator;
  }
}

},{"ngraph.random":7}],6:[function(require,module,exports){
module.exports = createCommunityGraph;

function createCommunityGraph(ngraph) {
  var nodeCount = ngraph.getNodesCount();
  var weight = 0;
  var nodes = [];
  var indexLookup = new Map();

  ngraph.forEachNode(function(node) {
    initNode(node.id);
  });

  ngraph.forEachLink(function(link) {
    var fromIdx = getNodeIdFromNgraph(link.fromId);
    var toIdx = getNodeIdFromNgraph(link.toId);

    var weight = getWeight(link.data);
    var fromNode = nodes[fromIdx];
    var toNode = nodes[toIdx];

    if (fromIdx === toIdx) {
      fromNode.selfLoopsCount += weight;
      fromNode.weightedDegree += weight;
    } else {
      // We do not list self-loops here.
      addNeighbour(fromNode, toIdx, weight);
      addNeighbour(toNode, fromIdx, weight);
      fromNode.weightedDegree += weight;
      toNode.weightedDegree += weight;
    }
  });

  weight = computeTotalWeight();

  return {
    nodeCount: nodeCount,
    weight: weight,

    forEachNeigbour: forEachNeigbour,

    getWeightedDegree: getWeightedDegree,
    getSelfLoopsCount: getSelfLoopsCount,

    getNodeIdFromNgraph: getNodeIdFromNgraph
  };

  function getNodeIdFromNgraph(id) {
    var idx = indexLookup.get(id);
    if (idx === undefined) throw new Error('Unknown node id: ' + id);

    return idx;
  }

  function addNeighbour(node, id, weight) {
      var info = {
        id: id,
        weight: weight
      };
      if (!node.neighbours) node.neighbours = [info];
      else node.neighbours.push(info);
      // PS: We do not init neighbours array unless it's trulyu needed
  }

  function forEachNeigbour(nodeId, cb) {
    var node = getNode(nodeId);
    if (!node.neighbours) return;

    for (var i = 0; i < node.neighbours.length; ++i) {
      var info = node.neighbours[i];
      cb(info.id, info.weight);
    }
  }

  function computeTotalWeight() {
    var weight = 0;
    for (var i = 0; i < nodeCount; ++i) {
      weight += getWeightedDegree(i);
    }
    return weight;
  }

  function getSelfLoopsCount(nodeId) {
    return getNode(nodeId).selfLoopsCount;
  }

  function getWeightedDegree(nodeId) {
    return getNode(nodeId).weightedDegree;
  }

  function getNode(nodeId) {
    var node = nodes[nodeId];
    if (!node) throw new Error('cannot find node with id: ' + nodeId);

    return node;
  }

  function initNode(id) {
    var node = {
      selfLoopsCount: 0,
      weightedDegree: 0,
      neighbours: null
    };

    var idx = nodes.length;
    indexLookup.set(id, idx);
    nodes.push(node);

    return idx;
  }
}

function getWeight(data) {
  if (!data) return 1;

  if (typeof data === 'number') return data;
  if (typeof data.weight === 'number') return data.weight;

  return 1;
}

},{}],7:[function(require,module,exports){
module.exports = {
  random: random,
  randomIterator: randomIterator
};

/**
 * Creates seeded PRNG with two methods:
 *   next() and nextDouble()
 */
function random(inputSeed) {
  var seed = typeof inputSeed === 'number' ? inputSeed : (+ new Date());
  var randomFunc = function() {
      // Robert Jenkins' 32 bit integer hash function.
      seed = ((seed + 0x7ed55d16) + (seed << 12))  & 0xffffffff;
      seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
      seed = ((seed + 0x165667b1) + (seed << 5))   & 0xffffffff;
      seed = ((seed + 0xd3a2646c) ^ (seed << 9))   & 0xffffffff;
      seed = ((seed + 0xfd7046c5) + (seed << 3))   & 0xffffffff;
      seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
      return (seed & 0xfffffff) / 0x10000000;
  };

  return {
      /**
       * Generates random integer number in the range from 0 (inclusive) to maxValue (exclusive)
       *
       * @param maxValue Number REQUIRED. Ommitting this number will result in NaN values from PRNG.
       */
      next : function (maxValue) {
          return Math.floor(randomFunc() * maxValue);
      },

      /**
       * Generates random double number in the range from 0 (inclusive) to 1 (exclusive)
       * This function is the same as Math.random() (except that it could be seeded)
       */
      nextDouble : function () {
          return randomFunc();
      }
  };
}

/*
 * Creates iterator over array, which returns items of array in random order
 * Time complexity is guaranteed to be O(n);
 */
function randomIterator(array, customRandom) {
    var localRandom = customRandom || random();
    if (typeof localRandom.next !== 'function') {
      throw new Error('customRandom does not match expected API: next() function is missing');
    }

    return {
        forEach : function (callback) {
            var i, j, t;
            for (i = array.length - 1; i > 0; --i) {
                j = localRandom.next(i + 1); // i inclusive
                t = array[j];
                array[j] = array[i];
                array[i] = t;

                callback(t);
            }

            if (array.length) {
                callback(array[0]);
            }
        },

        /**
         * Shuffles array randomly, in place.
         */
        shuffle : function () {
            var i, j, t;
            for (i = array.length - 1; i > 0; --i) {
                j = localRandom.next(i + 1); // i inclusive
                t = array[j];
                array[j] = array[i];
                array[i] = t;
            }

            return array;
        }
    };
}

},{}]},{},[1])(1)
});