var Louvain = {
    detectClusters: function (data)
    {
        var create = require("ngraph.graph");
        var detect = require("ngraph.louvain");
        var graph = create();

        data.nodes.forEach(function (node) {
            if (node.visible)
                graph.addNode(node.id, node);
        });
        data.edges.forEach(function (edge) {
            if (edge.visible)
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
