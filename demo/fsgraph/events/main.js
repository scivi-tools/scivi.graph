function main() {
    var controller = SciViFSGraph.main.GraphController.fromJson(g_data, 'forceAtlas2');
    var renderer = new SciViFSGraph.main.VivaWebGLRenderer(document.body);
        
    renderer.graphController = controller;
    renderer.viewRules = renderer.buildDefaultView(g_colors);
    renderer.run(1000);
}
