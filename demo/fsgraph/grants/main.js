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

function main() {
    var controller = SciViFSGraph.main.GraphController.fromStatedJson(g_data, 'forceAtlas2');
    var renderer = new SciViFSGraph.main.VivaWebGLRenderer(document.body);
        
    renderer.graphController = controller;
    renderer.viewRules = renderer.buildDefaultView(g_colors);
    renderer.run(1000);
}
