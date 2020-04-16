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
    
    var lang = SciViFSGraph.main.getParameterByName("lang") || "ru";
    document.documentElement.lang = lang;
    FSGraph.getOrCreateTranslatorInstance(lang).extend(g_fsgraph_loc);

    var renderer = new FSGraph.VivaWebGLRenderer(document.body);
    var usedLayout = FSGraph.getParameterByName("layout") || "HierarchicalLayout";
    var controller = FSGraph.GraphController.fromStatedJson(g_data);
    
        
    renderer.setGraphController(controller, usedLayout);
    renderer.viewRules = renderer.buildDefaultView(g_colors);
    renderer.run(1000);

    g_renderer = renderer;
}
