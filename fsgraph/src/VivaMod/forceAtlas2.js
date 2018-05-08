/**
 * =====================================
 * Fork of Sigma ForceAtlas2.5 Webworker 
 *    Author: Guillaume Plique (Yomguithereal)
 *    Algorithm author: Mathieu Jacomy @ Sciences Po Medialab & WebAtlas
 *    Version: 1.0.3
 * ====================================
 */

// TODO: physicsSimulator must have done half of this right way, haven't it?

module.exports = createLayout;

var eventify = require('ngraph.events');
var merge = require('ngraph.merge');

/**
 * Creates forceAtlas2 layout for a given graph.
 *
 * @param {ngraph.graph} graph which needs to be laid out
 * @param {object} settings if you need custom settings
 * for physics simulator you can pass your own settings here. If it's not passed
 * a default one will be created.
 */
function createLayout(graph, settings) {
  if (!graph) {
    throw new Error('Graph structure cannot be undefined');
  }

  /**
   * x: 0,
   * y: 1,
   * dx: 2,
   *  dy: 3,
   *   old_dx: 4,
   *   old_dy: 5,
   *   mass: 6,
   *   convergence: 7,
   *   size: 8,
   *   fixed: 9
   */
  var nodeBodies = Object.create(null);

  /**
   * source: 0,
      target: 1,
      weight: 2
   */
  var springs = {};

  /**
   * node: 0,
      centerX: 1,
      centerY: 2,
      size: 3,
      nextSibling: 4,
      firstChild: 5,
      mass: 6,
      massCenterX: 7,
      massCenterY: 8
   */
  var regions = [];//Object.create(null);
  var bodiesCount = 0;

  
  settings = merge(settings, {
    linLogMode: false,
    outboundAttractionDistribution: false,
    adjustSizes: false,
    edgeWeightInfluence: 0,
    scalingRatio: 1,
    strongGravityMode: false,
    gravity: 1,
    slowDown: 1,
    barnesHutOptimize: false,
    barnesHutTheta: 0.5,
    startingIterations: 1,
    iterationsPerRender: 1
  });

  var maxForce = 10,
      converged = false;
  
  var minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

  var //ppn = 1,
      //ppe = 1,
      ppr = 1;


  // Initialize physics with what we have in the graph:
  initPhysics();
  listenToEvents();

  var wasStable = false,
      stableLevel = 0.1,
      prevRatio = 42.0;

  var api = {
    /**
     * Performs one step of iterative layout algorithm
     *
     * @returns {boolean} true if the system should be considered stable; Flase otherwise.
     * The system is stable if no further call to `step()` can improve the layout.
     */
    step: function() {
      if (bodiesCount === 0) return true; // TODO: This will never fire 'stable'

      var lastMove = pass();

      // Save the movement in case if someone wants to query it in the step
      // callback.
      api.lastMove = lastMove;

      // Allow listeners to perform low-level actions after nodes are updated.
      api.fire('step');

      // TODO: кто же так хардкотит проверку стабилизации укладки? Мусорка!
      var ratio = lastMove / 2;//bodiesCount;
      var isStableNow = (ratio < stableLevel) && (prevRatio < stableLevel);

      if (wasStable !== isStableNow) {
        wasStable = isStableNow;
        onStableChanged(isStableNow);
      }

      prevRatio = ratio;

      return isStableNow;
    },

    /**
     * For a given `nodeId` returns position
     */
    getNodePosition: function (nodeId) {
      var body = getInitializedBody(nodeId);
      return body.pos;
    },

    /**
     * Sets position of a node to a given coordinates
     * @param {string} nodeId node identifier
     * @param {number} x position of a node
     * @param {number} y position of a node
     * @param {number=} z position of node (only if applicable to body)
     */
    setNodePosition: function (nodeId) {
      var body = getInitializedBody(nodeId);
      if (arguments[2]) {
        body.pos.y = arguments[2];
      }
      if (arguments[1]) {
        body.pos.x = arguments[1];
      }
    },

    /**
     * @returns {Object} Link position by link id
     * @returns {Object.from} {x, y} coordinates of link start
     * @returns {Object.to} {x, y} coordinates of link end
     */
    getLinkPosition: function (linkId) {
      var spring = springs[linkId];
      if (spring) {
        var src = getInitializedBody(spring.source);
        var dst = getInitializedBody(spring.target);
        return {
          from: src.pos,
          to: dst.pos
        };
      }
    },

    /**
     * @returns {Object} area required to fit in the graph. Object contains
     * `x1`, `y1` - top left coordinates
     * `x2`, `y2` - bottom right coordinates
     */
    getGraphRect: function () {
      if (!settings.barnesHutOptimize) {
        getRealRect();
      }
      return {
        x1: minX,
        x2: maxX,
        y1: minY,
        y2: maxY
      }
    },

    /**
     * Iterates over each body in the layout simulator and performs a callback(body, nodeId)
     */
    forEachBody: forEachBody,

    /*
     * Requests layout algorithm to pin/unpin node to its current position
     * Pinned nodes should not be affected by layout algorithm and always
     * remain at their position
     */
    pinNode: function (node, isPinned) {
      var body = getInitializedBody(node.id);
       body.fixed = !!isPinned;
    },

    /**
     * Checks whether given graph's node is currently pinned
     */
    isNodePinned: function (node) {
      return getInitializedBody(node.id).fixed;
    },

    /**
     * Request to release all resources
     */
    dispose: function() {
      graph.off('changed', onGraphChanged);
      api.fire('disposed');
    },

    /**
     * Gets physical body for a given node id. If node is not found undefined
     * value is returned.
     */
    getBody: getBody,

    /**
     * Gets spring for a given edge.
     *
     * @param {string} linkId link identifer. If two arguments are passed then
     * this argument is treated as formNodeId
     * @param {string=} toId when defined this parameter denotes head of the link
     * and first argument is trated as tail of the link (fromId)
     */
    getSpring: getSpring,

    /**
     * Gets the graph that was used for layout
     */
    graph: graph,

    /**
     * Gets amount of movement performed during last step opeartion
     */
    lastMove: 0
  };

  eventify(api);

  return api;

  function forEachBody(cb) {
    Object.keys(nodeBodies).forEach(function(bodyId) {
      cb(nodeBodies[bodyId], bodyId);
    });
  }

  function getSpring(fromId, toId) {
    var linkId;
    if (toId === undefined) {
      if (typeof fromId !== 'object') {
        // assume fromId as a linkId:
        linkId = fromId;
      } else {
        // assume fromId to be a link object:
        linkId = fromId.id;
      }
    } else {
      // toId is defined, should grab link:
      var link = graph.hasLink(fromId, toId);
      if (!link) return;
      linkId = link.id;
    }

    return springs[linkId];
  }

  function getBody(nodeId) {
    return nodeBodies[nodeId];
  }

  function listenToEvents() {
    graph.on('changed', onGraphChanged);
  }

  function onStableChanged(isStable) {
    api.fire('stable', isStable);
  }

  function onGraphChanged(changes) {
    for (var i = 0; i < changes.length; ++i) {
      var change = changes[i];
      if (change.changeType === 'add') {
        if (change.node) {
          initBody(change.node);
        }
        if (change.link) {
          initLink(change.link);
        }
      } else if (change.changeType === 'remove') {
        if (change.node) {
          releaseNode(change.node);
        }
        if (change.link) {
          releaseLink(change.link);
        }
      }
    }
    bodiesCount = graph.getNodesCount();
  }

  function initPhysics() {
    bodiesCount = 0;

    graph.forEachNode(function (node) {
      initBody(node);
      bodiesCount += 1;
    });

    graph.forEachLink(initLink);
  }

  function initBody(node) {
    if (!node) {
      throw new Error('initBody() was called with unknown node id');
    }
    var body = nodeBodies[node.id];
    if (!body) {
      var pos = node.position;
      if (!pos) {
        console.log('No node.position leads to random position!');
        pos = {
          x: Math.random() * 1500 - 750,
          y: Math.random() * 1500 - 750
        }
      }

      var body = {
        pos: pos
      };
      body.id = node.id;
      body.dx = body.dy = 0;
      body.old_dx = body.old_dy = 0;
      // FIXME: а это откуда? Пока не нужно, можно не искать
      body.convergence = 1;
      // FIXME: where da fuck we can get node size?! Пока не нужно, можно не искать
      body.size = Math.random() * 5 + 1;
      body.fixed = false;

      nodeBodies[node.id] = body;
      updateBodyMass(node.id);

      if (isNodeOriginallyPinned(node)) {
        body.fixed = true;
      }
    }
  }

  function releaseNode(node) {
    var nodeId = node.id;
    var body = nodeBodies[nodeId];
    if (body) {
      nodeBodies[nodeId] = null;
      delete nodeBodies[nodeId];

      // physicsSimulator.removeBody(body);
    }
  }

  function initLink(link) {
    updateBodyMass(link.fromId);
    updateBodyMass(link.toId);

    // var fromBody = nodeBodies[link.fromId],
    //     toBody  = nodeBodies[link.toId],
    //     spring = physicsSimulator.addSpring(fromBody, toBody, link.length);

    // springTransform(link, spring);
    var spring = {
      source: link.fromId,
      target: link.toId,
      // FIXME: incorrect edge weight?
      weight: link.weight != null ? link.weight : 1
    }


    springs[link.id] = spring;
  }

  function releaseLink(link) {
    var spring = springs[link.id];
    if (spring) {
      var from = graph.getNode(link.fromId),
          to = graph.getNode(link.toId);

      if (from) updateBodyMass(from.id);
      if (to) updateBodyMass(to.id);

      delete springs[link.id];

      // physicsSimulator.removeSpring(spring);
    }
  }

  function getNeighborBodies(node) {
    // TODO: Could probably be done better on memory
    var neighbors = [];
    if (!node.links) {
      return neighbors;
    }
    var maxNeighbors = Math.min(node.links.length, 2);
    for (var i = 0; i < maxNeighbors; ++i) {
      var link = node.links[i];
      var otherBody = link.fromId !== node.id ? nodeBodies[link.fromId] : nodeBodies[link.toId];
      if (otherBody && otherBody.pos) {
        neighbors.push(otherBody);
      }
    }

    return neighbors;
  }

  function updateBodyMass(nodeId) {
    var body = nodeBodies[nodeId];
    body.mass = nodeMass(nodeId);
  }

  /**
   * Checks whether graph node has in its settings pinned attribute,
   * which means layout algorithm cannot move it. Node can be preconfigured
   * as pinned, if it has "isPinned" attribute, or when node.data has it.
   *
   * @param {Object} node a graph node to check
   * @return {Boolean} true if node should be treated as pinned; false otherwise.
   */
  function isNodeOriginallyPinned(node) {
    return (node && (node.isPinned || (node.data && node.data.isPinned)));
  }

  function getInitializedBody(nodeId) {
    var body = nodeBodies[nodeId];
    if (!body) {
      var node = graph.getNode(nodeId);
      initBody(node);
      body = nodeBodies[nodeId];
    }
    return body;
  }

  /**
   * Calculates mass of a body, which corresponds to node with given id.
   *
   * @param {String|Number} nodeId identifier of a node, for which body mass needs to be calculated
   * @returns {Number} recommended mass of the body;
   */
  function nodeMass(nodeId) {
    var links = graph.getLinks(nodeId);
    if (!links) return 1;
    return 1 + links.length / 3.0;
  }

  function getRealRect() {
    minX = Infinity;
    maxX = -Infinity;
    minY = Infinity;
    maxY = -Infinity;

    // Computing min and max values
    Object.keys(nodeBodies).forEach((n) => {
      minX = Math.min(minX, nodeBodies[n].pos.x);
      maxX = Math.max(maxX, nodeBodies[n].pos.x);
      minY = Math.min(minY, nodeBodies[n].pos.y);
      maxY = Math.max(maxY, nodeBodies[n].pos.y);
    });
  }

  //==================================================================================

  function initRegion(id) {
    regions[id] = {
      node: -1,
      centerX: 0,
      centerY: 0,
      size: 1,
      nextSibling: id + ppr,
      firstChild: -1,
      mass: 0,
      massCenterX: 0,
      massCenterY: 0
    };
  }

  function pass() {
    var a, i, j, l, r, n, n1, n2, e, w, g, k, m;
    var nodesLength = Object.keys(nodeBodies).length;

    var outboundAttCompensation,
        coefficient,
        xDist,
        yDist,
        ewc,
        mass,
        distance,
        size,
        factor;

    // 1) Initializing layout data
    //-----------------------------

    let nodeBodiesKeys = Object.keys(nodeBodies);
    let nodeBodiesKeysLength = nodeBodiesKeys.length;
    let edgeBodiesKeys = Object.keys(springs);
    let edgeBodiesKeysLength = edgeBodiesKeys.length;

    outboundAttCompensation = 0;
    // Resetting positions & computing max values
    // for (n = 0; n < nodesLength; n += ppn) {
    for (let x = 0; x < nodeBodiesKeysLength; x++) {
      n = nodeBodiesKeys[x];
      nodeBodies[n].old_dx = nodeBodies[n].dx;
      nodeBodies[n].old_dy = nodeBodies[n].dy;
      nodeBodies[n].dx = 0;
      nodeBodies[n].dy = 0;

      outboundAttCompensation += nodeBodies[n].mass;
    }

    // If outbound attraction distribution, compensate
    if (settings.outboundAttractionDistribution) {
      outboundAttCompensation /= nodesLength;
    }


    // 1.bis) Barnes-Hut computation
    //------------------------------

    if (settings.barnesHutOptimize) {

      var q, q0, q1, q2, q3;
      // Setting up
      // RegionMatrix = new Float32Array(nodesLength / ppn * 4 * ppr);
      regions.length = nodesLength * 4;

      getRealRect();

      if (!regions[0]) {
        initRegion(0);
      }

      // Build the Barnes Hut root region
      regions[0].node = -1;
      regions[0].centerX = (minX + maxX) / 2;
      regions[0].centerY = (minY + maxY) / 2;
      regions[0].size = Math.max(maxX - minX, maxY - minY);
      regions[0].nextSibling = -1;
      regions[0].firstChild = -1;
      regions[0].mass = 0;
      regions[0].massCenterX = 0;
      regions[0].massCenterY = 0;

      // Add each node in the tree
      l = 1;
      // for (n = 0; n < nodesLength; n += ppn) {
      for (let x = 0; x < nodeBodiesKeysLength; x++) {
        n = nodeBodiesKeys[x];
        // Current region, starting with root
        r = 0;

        while (true) {
          // Are there sub-regions?

          // We look at first child index
          if (regions[r].firstChild >= 0) {

            // There are sub-regions

            // We just iterate to find a "leave" of the tree
            // that is an empty region or a region with a single node
            // (see next case)

            // Find the quadrant of n
            if (nodeBodies[n].pos.x < regions[r].centerX) {

              if (nodeBodies[n].pos.y < regions[r].centerY) {

                // Top Left quarter
                q = regions[r].firstChild;
              }
              else {

                // Bottom Left quarter
                q = regions[r].firstChild + ppr;
              }
            }
            else {
              if (nodeBodies[n].pos.y < regions[r].centerY) {

                // Top Right quarter
                q = regions[r].firstChild + ppr * 2;
              }
              else {

                // Bottom Right quarter
                q = regions[r].firstChild + ppr * 3;
              }
            }

            // Update center of mass and mass (we only do it for non-leave regions)
            regions[r].massCenterX =
              (regions[r].massCenterX * regions[r].mass +
               nodeBodies[n].pos.x * nodeBodies[n].mass) /
              (regions[r].mass + nodeBodies[n].mass);

            regions[r].massCenterY =
              (regions[r].massCenterY * regions[r].mass +
               nodeBodies[n].pos.y * nodeBodies[n].mass) /
              (regions[r].mass + nodeBodies[n].mass);

            regions[r].mass += nodeBodies[n].mass;

            // Iterate on the right quadrant
            r = q;
            continue;
          }
          else {

            // There are no sub-regions: we are in a "leave"

            // Is there a node in this leave?
            if (regions[r].node < 0) {

              // There is no node in region:
              // we record node n and go on
              regions[r].node = n;
              break;
            }
            else {

              // There is a node in this region

              // We will need to create sub-regions, stick the two
              // nodes (the old one r[0] and the new one n) in two
              // subregions. If they fall in the same quadrant,
              // we will iterate.

              // Create sub-regions
              regions[r].firstChild = l * ppr;
              w = regions[r].size / 2;  // new size (half)

              // NOTE: we use screen coordinates
              // from Top Left to Bottom Right

              // Top Left sub-region
              g = regions[r].firstChild;
              if (!regions[g]) {
                initRegion(g);
              }

              regions[g].node = -1;
              regions[g].centerX = regions[r].centerX - w;
              regions[g].centerY = regions[r].centerY - w;
              regions[g].size = w;
              regions[g].nextSibling = g + ppr;
              regions[g].firstChild = -1;
              regions[g].mass = 0;
              regions[g].massCenterX = 0;
              regions[g].massCenterY = 0;

              // Bottom Left sub-region
              g += ppr;
              if (!regions[g]) {
                initRegion(g);
              }
              regions[g].node = -1;
              regions[g].centerX = regions[r].centerX - w;
              regions[g].centerY = regions[r].centerY + w;
              regions[g].size = w;
              regions[g].nextSibling = g + ppr;
              regions[g].firstChild = -1;
              regions[g].mass = 0;
              regions[g].massCenterX = 0;
              regions[g].massCenterY = 0;

              // Top Right sub-region
              g += ppr;
              if (!regions[g]) {
                initRegion(g);
              }
              regions[g].node = -1;
              regions[g].centerX = regions[r].centerX + w;
              regions[g].centerY = regions[r].centerY - w;
              regions[g].size = w;
              regions[g].nextSibling = g + ppr;
              regions[g].firstChild = -1;
              regions[g].mass = 0;
              regions[g].massCenterX = 0;
              regions[g].massCenterY = 0;

              // Bottom Right sub-region
              g += ppr;
              if (!regions[g]) {
                initRegion(g);
              }
              regions[g].node = -1;
              regions[g].centerX = regions[r].centerX + w;
              regions[g].centerY = regions[r].centerY + w;
              regions[g].size = w;
              regions[g].nextSibling = regions[r].nextSibling;
              regions[g].firstChild = -1;
              regions[g].mass = 0;
              regions[g].massCenterX = 0;
              regions[g].massCenterY = 0;

              l += 4;

              // Now the goal is to find two different sub-regions
              // for the two nodes: the one previously recorded (r[0])
              // and the one we want to add (n)

              // Find the quadrant of the old node
              if (nodeBodies[regions[r].node].pos.x < regions[r].centerX) {
                if (nodeBodies[regions[r].node].pos.y < regions[r].centerY) {

                  // Top Left quarter
                  q = regions[r].firstChild;
                }
                else {

                  // Bottom Left quarter
                  q = regions[r].firstChild + ppr;
                }
              }
              else {
                if (nodeBodies[regions[r].node].pos.y < regions[r].centerY) {

                  // Top Right quarter
                  q = regions[r].firstChild + ppr * 2;
                }
                else {

                  // Bottom Right quarter
                  q = regions[r].firstChild + ppr * 3;
                }
              }

              // We remove r[0] from the region r, add its mass to r and record it in q
              regions[r].mass = nodeBodies[regions[r].node].mass;
              regions[r].massCenterX = nodeBodies[regions[r].node].pos.x;
              regions[r].massCenterY = nodeBodies[regions[r].node].pos.y;

              regions[q].node = regions[r].node;
              regions[r].node = -1;

              // Find the quadrant of n
              if (nodeBodies[n].pos.x < regions[r].centerX) {
                if (nodeBodies[n].pos.y < regions[r].centerY) {

                  // Top Left quarter
                  q2 = regions[r].firstChild;
                }
                else {
                  // Bottom Left quarter
                  q2 = regions[r].firstChild + ppr;
                }
              }
              else {
                if(nodeBodies[n].pos.y < regions[r].centerY) {

                  // Top Right quarter
                  q2 = regions[r].firstChild + ppr * 2;
                }
                else {

                  // Bottom Right quarter
                  q2 = regions[r].firstChild + ppr * 3;
                }
              }

              if (q === q2) {

                // If both nodes are in the same quadrant,
                // we have to try it again on this quadrant
                r = q;
                continue;
              }

              // If both quadrants are different, we record n
              // in its quadrant
              regions[q2].node = n;
              break;
            }
          }
        }
      }
    }


    // 2) Repulsion
    //--------------
    // NOTES: adjustSizes = antiCollision & scalingRatio = coefficient

    if (settings.barnesHutOptimize) {
      coefficient = settings.scalingRatio;

      // Applying repulsion through regions
      // for (n = 0; n < nodesLength; n += ppn) {
      for (let x = 0; x < nodeBodiesKeysLength; x++) {
        n = nodeBodiesKeys[x];

        // Computing leaf quad nodes iteration

        r = 0; // Starting with root region
        while (true) {

          if (regions[r].firstChild >= 0) {

            // The region has sub-regions

            // We run the Barnes Hut test to see if we are at the right distance
            distance = Math.sqrt(
              (Math.pow(nodeBodies[n].pos.x - regions[r].massCenterX, 2)) +
              (Math.pow(nodeBodies[n].pos.y - regions[r].massCenterY, 2))
            );

            if (2 * regions[r].size / distance < settings.barnesHutTheta) {

              // We treat the region as a single body, and we repulse

              xDist = nodeBodies[n].pos.x - regions[r].massCenterX;
              yDist = nodeBodies[n].pos.y - regions[r].massCenterY;

              if (settings.adjustSizes) {

                //-- Linear Anti-collision Repulsion
                if (distance > 0) {
                  factor = coefficient * nodeBodies[n].mass *
                    regions[r].mass / distance / distance;

                  nodeBodies[n].dx += xDist * factor;
                  nodeBodies[n].dy += yDist * factor;
                }
                else if (distance < 0) {
                  factor = -coefficient * nodeBodies[n].mass *
                    regions[r].mass / distance;

                  nodeBodies[n].dx += xDist * factor;
                  nodeBodies[n].dy += yDist * factor;
                }
              }
              else {

                //-- Linear Repulsion
                if (distance > 0) {
                  factor = coefficient * nodeBodies[n].mass *
                    regions[r].mass / distance / distance;

                  nodeBodies[n].dx += xDist * factor;
                  nodeBodies[n].dy += yDist * factor;
                }
              }

              // When this is done, we iterate. We have to look at the next sibling.
              if (regions[r].nextSibling < 0)
                break;  // No next sibling: we have finished the tree
              r = regions[r].nextSibling;
              continue;

            }
            else {

              // The region is too close and we have to look at sub-regions
              r = regions[r].firstChild;
              continue;
            }

          }
          else {

            // The region has no sub-region
            // If there is a node r[0] and it is not n, then repulse

            if (regions[r].node >= 0 && regions[r].node !== n) {
              xDist = nodeBodies[n].pos.x - nodeBodies[regions[r].node].pos.x;
              yDist = nodeBodies[n].pos.y - nodeBodies[regions[r].node].pos.y;

              distance = Math.sqrt(xDist * xDist + yDist * yDist);

              if (settings.adjustSizes) {

                //-- Linear Anti-collision Repulsion
                if (distance > 0) {
                  factor = coefficient * nodeBodies[n].mass *
                  nodeBodies[regions[r].node].mass / distance / distance;

                  nodeBodies[n].dx += xDist * factor;
                  nodeBodies[n].dy += yDist * factor;
                }
                else if (distance < 0) {
                  factor = -coefficient * nodeBodies[n].mass *
                  nodeBodies[regions[r].node].mass / distance;

                  nodeBodies[n].dx += xDist * factor;
                  nodeBodies[n].dy += yDist * factor;
                }
              }
              else {

                //-- Linear Repulsion
                if (distance > 0) {
                  factor = coefficient * nodeBodies[n].mass *
                  nodeBodies[regions[r].node].mass / distance / distance;
                  nodeBodies[n].dx += xDist * factor;
                  nodeBodies[n].dy += yDist * factor;
                }
              }

            }

            // When this is done, we iterate. We have to look at the next sibling.
            if (regions[r].nextSibling < 0)
              break;  // No next sibling: we have finished the tree
            r = regions[r].nextSibling;
            continue;
          }
        }
      }
    }
    else {
      coefficient = settings.scalingRatio;

      // Square iteration
      // for (n1 = 0; n1 < nodesLength; n1 += ppn) {
      for (let x1 = 0; x1 < nodeBodiesKeysLength; x1++) {
        n1 = nodeBodiesKeys[x1];
        // for (n2 = 0; n2 < n1; n2 += ppn) { 
        for (let x2 = 0; x2 < nodeBodiesKeysLength; x2++) {
          n2 = nodeBodiesKeys[x2];

          // Common to both methods
          xDist = nodeBodies[n1].pos.x - nodeBodies[n2].pos.x;
          yDist = nodeBodies[n1].pos.y - nodeBodies[n2].pos.y;

          if (settings.adjustSizes) {

            //-- Anticollision Linear Repulsion
            distance = Math.sqrt(xDist * xDist + yDist * yDist) -
              nodeBodies[n1].size -
              nodeBodies[n2].size;

            if (distance > 0) {
              factor = coefficient *
                nodeBodies[n1].mass *
                nodeBodies[n2].mass /
                distance / distance;

              // Updating nodes' dx and dy
              nodeBodies[n1].dx += xDist * factor;
              nodeBodies[n1].dy += yDist * factor;

              nodeBodies[n2].dx += xDist * factor;
              nodeBodies[n2].dy += yDist * factor;
            }
            else if (distance < 0) {
              factor = 100 * coefficient *
                nodeBodies[n1].mass *
                nodeBodies[n2].mass;

              // Updating nodes' dx and dy
              nodeBodies[n1].dx += xDist * factor;
              nodeBodies[n1].dy += yDist * factor;

              nodeBodies[n2].dx -= xDist * factor;
              nodeBodies[n2].dy -= yDist * factor;
            }
          }
          else {

            //-- Linear Repulsion
            distance = Math.sqrt(xDist * xDist + yDist * yDist);

            if (distance > 0) {
              factor = coefficient *
                nodeBodies[n1].mass *
                nodeBodies[n2].mass /
                distance / distance;

              // Updating nodes' dx and dy
              nodeBodies[n1].dx += xDist * factor;
              nodeBodies[n1].dy += yDist * factor;

              nodeBodies[n2].dx -= xDist * factor;
              nodeBodies[n2].dy -= yDist * factor;
            }
          }
        }
      }
    }


    // 3) Gravity
    //------------
    g = settings.gravity / settings.scalingRatio;
    coefficient = settings.scalingRatio;
    // for (n = 0; n < nodesLength; n += ppn) {
    // Object.keys(nodeBodies).forEach((n) => {
    for (let x = 0; x < nodeBodiesKeysLength; x++) {
      n = nodeBodiesKeys[x];
      factor = 0;

      // Common to both methods
      xDist = nodeBodies[n].pos.x;
      yDist = nodeBodies[n].pos.y;
      distance = Math.sqrt(
        Math.pow(xDist, 2) + Math.pow(yDist, 2)
      );

      if (settings.strongGravityMode) {

        //-- Strong gravity
        if (distance > 0)
          factor = coefficient * nodeBodies[n].mass * g;
      }
      else {

        //-- Linear Anti-collision Repulsion n
        if (distance > 0)
          factor = coefficient * nodeBodies[n].mass * g / distance;
      }

      // Updating node's dx and dy
      nodeBodies[n].dx -= xDist * factor;
      nodeBodies[n].dy -= yDist * factor;
    }



    // 4) Attraction
    //---------------
    coefficient = 1 *
      (settings.outboundAttractionDistribution ?
        outboundAttCompensation :
        1);

    // TODO: simplify distance
    // TODO: coefficient is always used as -c --> optimize?
    // Object.keys(springs).forEach((e) => {
    for (let _s = 0; _s < edgeBodiesKeysLength; _s++) {
      e = edgeBodiesKeys[_s];
      n1 = springs[e].source;
      n2 = springs[e].target;
      w = springs[e].weight;

      // Edge weight influence
      ewc = Math.pow(w, settings.edgeWeightInfluence);

      // Common measures
      xDist = nodeBodies[n1].pos.x - nodeBodies[n2].pos.x;
      yDist = nodeBodies[n1].pos.y - nodeBodies[n2].pos.y;

      // Applying attraction to nodes
      if (settings.adjustSizes) {

        distance = Math.sqrt(
          (Math.pow(xDist, 2) + Math.pow(yDist, 2)) -
          nodeBodies[n1].size -
          nodeBodies[n2].size
        );

        if (settings.linLogMode) {
          if (settings.outboundAttractionDistribution) {

            //-- LinLog Degree Distributed Anti-collision Attraction
            if (distance > 0) {
              factor = -coefficient * ewc * Math.log(1 + distance) /
              distance /
              nodeBodies[n1].mass;
            }
          }
          else {

            //-- LinLog Anti-collision Attraction
            if (distance > 0) {
              factor = -coefficient * ewc * Math.log(1 + distance) / distance;
            }
          }
        }
        else {
          if (settings.outboundAttractionDistribution) {

            //-- Linear Degree Distributed Anti-collision Attraction
            if (distance > 0) {
              factor = -coefficient * ewc / nodeBodies[n1].mass;
            }
          }
          else {

            //-- Linear Anti-collision Attraction
            if (distance > 0) {
              factor = -coefficient * ewc;
            }
          }
        }
      }
      else {

        distance = Math.sqrt(
          Math.pow(xDist, 2) + Math.pow(yDist, 2)
        );

        if (settings.linLogMode) {
          if (settings.outboundAttractionDistribution) {

            //-- LinLog Degree Distributed Attraction
            if (distance > 0) {
              factor = -coefficient * ewc * Math.log(1 + distance) /
                distance /
                nodeBodies[n1].mass;
            }
          }
          else {

            //-- LinLog Attraction
            if (distance > 0)
              factor = -coefficient * ewc * Math.log(1 + distance) / distance;
          }
        }
        else {
          if (settings.outboundAttractionDistribution) {

            //-- Linear Attraction Mass Distributed
            // NOTE: Distance is set to 1 to override next condition
            distance = 1;
            factor = -coefficient * ewc / nodeBodies[n1].mass;
          }
          else {

            //-- Linear Attraction
            // NOTE: Distance is set to 1 to override next condition
            distance = 1;
            factor = -coefficient * ewc;
          }
        }
      }

      // Updating nodes' dx and dy
      // TODO: if condition or factor = 1?
      if (distance > 0) {

        // Updating nodes' dx and dy
        nodeBodies[n1].dx += xDist * factor;
        nodeBodies[n1].dy += yDist * factor;

        nodeBodies[n2].dx -= xDist * factor;
        nodeBodies[n2].dy -= yDist * factor;
      }
    }


    // 5) Apply Forces
    //-----------------
    var force,
        swinging,
        traction,
        nodespeed,
        minDiff = Infinity,
        maxDiff = -Infinity,
        diff;

    // MATH: sqrt and square distances
    if (settings.adjustSizes) {

      // for (n = 0; n < nodesLength; n += ppn) {
      for (let x = 0; x < nodeBodiesKeysLength; x++) {
        n = nodeBodiesKeys[x];
        if (!nodeBodies[n].fixed) {
          force = Math.sqrt(
            Math.pow(nodeBodies[n].dx, 2) +
            Math.pow(nodeBodies[n].dy, 2)
          );

          if (force > maxForce) {
            nodeBodies[n].dx =
              nodeBodies[n].dx * maxForce / force;
            nodeBodies[n].dy =
              nodeBodies[n].dy * maxForce / force;
          }

          swinging = nodeBodies[n].mass *
            Math.sqrt(
              (nodeBodies[n].old_dx - nodeBodies[n].dx) *
              (nodeBodies[n].old_dx - nodeBodies[n].dx) +
              (nodeBodies[n].old_dy - nodeBodies[n].dy) *
              (nodeBodies[n].old_dy - nodeBodies[n].dy)
            );

          traction = Math.sqrt(
            (nodeBodies[n].old_dx + nodeBodies[n].dx) *
            (nodeBodies[n].old_dx + nodeBodies[n].dx) +
            (nodeBodies[n].old_dy + nodeBodies[n].dy) *
            (nodeBodies[n].old_dy + nodeBodies[n].dy)
          ) / 2;

          nodespeed =
            0.1 * Math.log(1 + traction) / (1 + Math.sqrt(swinging));

          // Updating node's positon
          diff = nodeBodies[n].dx *
            (nodespeed / settings.slowDown);
          if (diff > maxDiff)
            maxDiff = diff;
          if (diff < minDiff)
            minDiff = diff;
          nodeBodies[n].pos.x =
            nodeBodies[n].pos.x + diff;

          diff = nodeBodies[n].dy *
            (nodespeed / settings.slowDown);
          if (diff > maxDiff)
            maxDiff = diff;
          if (diff < minDiff)
            minDiff = diff;
          nodeBodies[n].pos.y =
            nodeBodies[n].pos.y + diff;
        }
      }
    }
    else {

      // for (n = 0; n < nodesLength; n += ppn) {
      for (let x = 0; x < nodeBodiesKeysLength; x++) {
        n = nodeBodiesKeys[x];
        if (!nodeBodies[n].fixed) {

          swinging = nodeBodies[n].mass *
            Math.sqrt(
              (nodeBodies[n].old_dx - nodeBodies[n].dx) *
              (nodeBodies[n].old_dx - nodeBodies[n].dx) +
              (nodeBodies[n].old_dy - nodeBodies[n].dy) *
              (nodeBodies[n].old_dy - nodeBodies[n].dy)
            );

          traction = Math.sqrt(
            (nodeBodies[n].old_dx + nodeBodies[n].dx) *
            (nodeBodies[n].old_dx + nodeBodies[n].dx) +
            (nodeBodies[n].old_dy + nodeBodies[n].dy) *
            (nodeBodies[n].old_dy + nodeBodies[n].dy)
          ) / 2;

          nodespeed = nodeBodies[n].convergence *
            Math.log(1 + traction) / (1 + Math.sqrt(swinging));

          // Updating node convergence
          nodeBodies[n].convergence =
            Math.min(1, Math.sqrt(
              nodespeed *
              (Math.pow(nodeBodies[n].dx, 2) +
               Math.pow(nodeBodies[n].dy, 2)) /
              (1 + Math.sqrt(swinging))
            ));

          // Updating node's positon
          diff = nodeBodies[n].dx *
            (nodespeed / settings.slowDown);
          if (diff > maxDiff)
            maxDiff = diff;
          if (diff < minDiff)
            minDiff = diff;
          nodeBodies[n].pos.x =
            nodeBodies[n].pos.x + diff;

          diff = nodeBodies[n].dy *
            (nodespeed / settings.slowDown);
          if (diff > maxDiff)
            maxDiff = diff;
          if (diff < minDiff)
            minDiff = diff;
          nodeBodies[n].pos.y =
            nodeBodies[n].pos.y + diff;
        }
      }
    }

    diff = Math.max(Math.abs(minDiff), Math.abs(maxDiff));
    return diff;
  }

}

function noop() { }
