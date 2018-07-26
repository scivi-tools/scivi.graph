/**
 * Сейчас по парам вида "невыделен - выделен";
 * начиная от связи и продолжая всеми типами вершин по группам
 */

var g_colors = [
    // link
    0x4C57D877, 0x081973FF,
    // node1
    0xFFBA60FF, 0xFF6F00FF,
    // node2
    0xD5EAFFFF, 0x004282FF
];

var FSGraph = SciViFSGraph.main;

function main() {
    var usedLayout = FSGraph.getParameterByName("layout") || "forceAtlas2";
    var lang = SciViFSGraph.main.getParameterByName("lang") || "ru";
    document.documentElement.lang = lang;
    FSGraph.getOrCreateTranslatorInstance(lang).extend(g_fsgraph_loc);

    var controller = FSGraph.GraphController.fromJson(g_data, usedLayout);
    var renderer = new FSGraph.VivaWebGLRenderer(document.body);
        
    renderer.graphController = controller;
    renderer.viewRules = renderer.buildDefaultView(g_colors, ['circle', 'romb']);
    renderer.run(1000);
}
