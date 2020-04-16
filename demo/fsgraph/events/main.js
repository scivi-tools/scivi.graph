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
    0xD533ff00, 0x0033ff00
];

var FSGraph = SciViFSGraph.main;

function main() {
    var lang = SciViFSGraph.main.getParameterByName("lang") || "ru";
    document.documentElement.lang = lang;
    FSGraph.getOrCreateTranslatorInstance(lang).extend(g_fsgraph_loc);

	var renderer = new FSGraph.VivaWebGLRenderer(document.body);
	var usedLayout = FSGraph.getParameterByName("layout") || "HierarchicalLayout";
    var controller = FSGraph.GraphController.fromJson(g_data);
    
        
    renderer.setGraphController(controller, usedLayout);
    renderer.viewRules = renderer.buildDefaultView(g_colors, ['circle', 'romb']);
    renderer.run(1000);
}
