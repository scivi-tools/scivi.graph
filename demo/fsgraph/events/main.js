function main() {
    var renderer = new SciViFSGraph.VivaWebGLRenderer($('#view')[0]);

    Split(['#a', '#b'], {
        gutterSize: 8,
        cursor: 'col-resize',
        sizes: [75, 25],
        onDrag: () => renderer.onContainerResize()
    });

    $("#tabs").tabs({heightStyle: "fill"});

    // TODO: должно быть наоборот - это рендерер должен знать о контроллере
    var controller = SciViFSGraph.GraphController.fromJson(g_data);
    controller.renderer = renderer;

    controller.run(1000);
    //  g_colors);
}
