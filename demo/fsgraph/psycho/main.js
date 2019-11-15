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
    var lang = SciViFSGraph.main.getParameterByName("lang") || "ru";
    document.documentElement.lang = lang;
    FSGraph.getOrCreateTranslatorInstance(lang).extend(g_fsgraph_loc);

	var renderer = new FSGraph.VivaWebGLRenderer(document.body);
    var usedLayout = FSGraph.getParameterByName("layout") || "CircleLayout";
    //теперь графовое состояние не зависит от укладки
    var controller = FSGraph.GraphController.fromStatedJson(g_data);
    
    //укладка строится уже на этапе подключения графа к процессу рендеринга
    renderer.setGraphController(controller, usedLayout);
    renderer.viewRules = renderer.buildDefaultView(g_colors, ['circle', 'romb']);
    renderer.run(1000);
}
