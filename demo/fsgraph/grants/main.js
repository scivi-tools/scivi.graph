/**
 * Сейчас по парам вида "невыделен - выделен";
 * начиная от связи и продолжая всеми типами вершин по группам
 */

var g_colors = [
    // link
    0x4C57D8BB, 0x081973FF,
    // node1
    0xFFBA60FF, 0xFF6F00FF
];

var FSGraph = SciViFSGraph.main;
var g_renderer = null;

function main() {
    var usedLayout = FSGraph.getParameterByName("layout") || "forceAtlas2f";
    var controller = FSGraph.GraphController.fromStatedJson(g_data, usedLayout);
    var renderer = new FSGraph.VivaWebGLRenderer(document.body);
        
    renderer.graphController = controller;
    renderer.viewRules = renderer.buildDefaultView(g_colors);
    renderer.run(1000);

    g_renderer = renderer;
}
