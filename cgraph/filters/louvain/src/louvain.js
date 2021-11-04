var Louvain = {
        detectClusters: function (data)
        {
            function createCommunityGraph(ngraph)
        {
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

            function getNodeIdFromNgraph(id)
            {
                var idx = indexLookup.get(id);
                if (idx === undefined) throw new Error('Unknown node id: ' + id);

                return idx;
            }

            function addNeighbour(node, id, weight)
            {
                var info = {
                    id: id,
                    weight: weight
                };
                if (!node.neighbours) node.neighbours = [info];
                else node.neighbours.push(info);
                // PS: We do not init neighbours array unless it's trulyu needed
            }

            function forEachNeigbour(nodeId, cb)
            {
                var node = getNode(nodeId);
                if (!node.neighbours) return;

                for (var i = 0; i < node.neighbours.length; ++i) {
                    var info = node.neighbours[i];
                    cb(info.id, info.weight);
                }
            }

            function computeTotalWeight()
            {
                var weight = 0;
                for (var i = 0; i < nodeCount; ++i) {
                    weight += getWeightedDegree(i);
                }
                return weight;
            }

            function getSelfLoopsCount(nodeId)
            {
                return getNode(nodeId).selfLoopsCount;
            }

            function getWeightedDegree(nodeId)
            {
                return getNode(nodeId).weightedDegree;
            }

            function getNode(nodeId)
            {
                var node = nodes[nodeId];
                if (!node) throw new Error('cannot find node with id: ' + nodeId);

                return node;
            }

            function initNode(id)
            {
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

        function getWeight(data)
        {
            if (!data) return 1;

            if (typeof data === 'number') return data;
            if (typeof data.weight === 'number') return data.weight;

            return 1;
        }

        function createCommunity(graph)
        {
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

            function getClass(id)
            {
                return nodeToCommunity[id];
            }

            function optimizeModularity()
            {
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

            function getNeighbouringCommunities(nodeId)
            {
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

            function getModularityGain(nodeId, sharedWeight, communityId, degree)
            {
                var totalLinksWeightInThisCommunity = totalLinksWeight[communityId];

                return sharedWeight - totalLinksWeightInThisCommunity * degree/graphWeight;
            }

            function removeFromCommunity(nodeId, communityId, sharedLinksWeight)
            {
                totalLinksWeight[communityId] -= graph.getWeightedDegree(nodeId);
                internalLinksWeight[communityId] -= 2 * sharedLinksWeight + graph.getSelfLoopsCount(nodeId);
                nodeToCommunity[nodeId] = -1;
            }

            function insertIntoCommunity(nodeId, communityId, sharedLinksWeight)
            {
                totalLinksWeight[communityId] += graph.getWeightedDegree(nodeId);
                internalLinksWeight[communityId] += 2 * sharedLinksWeight + graph.getSelfLoopsCount(nodeId);
                nodeToCommunity[nodeId] = communityId;
            }

            function modularity()
            {
                var result = 0;

                for (var communityId = 0; communityId < nodeCount; ++communityId) {
                    if (totalLinksWeight[communityId] > 0) {
                        var dw = totalLinksWeight[communityId] / graphWeight;
                        result += internalLinksWeight[communityId] / graphWeight - dw * dw;
                    }
                }

                return result;
            }

            function getRandomNodeIdIterator()
            {
                var iterator = [];

                for (var i = 0; i < nodeCount; ++i) {
                    iterator[i] = i;
                }

                var nrandom = require("ngraph.random");
                var seededRandom = nrandom.random(42);
                var randomIterator = nrandom.randomIterator;
                randomIterator(iterator, seededRandom).shuffle();

                return iterator;
            }
        }

        function modularity(ngraph)
        {
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

        var create = require("ngraph.graph");
        var detect = modularity;
        var graph = create();

        data.nodes.forEach(function (node) {
            if (node.visible)
                graph.addNode(node.positionHash(), node);
        });
        data.edges.forEach(function (edge) {
            if (edge.visible)
                graph.addLink(edge.source.positionHash(), edge.target.positionHash());
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
