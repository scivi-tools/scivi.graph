function main() {
    var renderer = new SciViFSGraph.VivaWebGLRenderer($('#view')[0]);

    Split(['#a', '#b'], {
        gutterSize: 8,
        cursor: 'col-resize',
        sizes: [75, 25],
        onDrag: () => renderer.onContainerResize()
    });

    $("#tabs").tabs({
        heightStyle: "fill"
    });

    $("#rotateBar").slider({
        min: -179,
        max: 179,
        value: 0,
        step: 1,
        slide: (event, ui) => {
            renderer.graphics.rotate(ui.value * Math.PI / 180);
            renderer.rerender();
        }
    });

    // TODO: должно быть наоборот - это рендерер должен знать о контроллере
    var controller = SciViFSGraph.GraphController.fromJson(g_data);
    controller.renderer = renderer;

    controller.run(1000);

    window.mygraphics = renderer.graphics;
    window.myctrl = controller;
    //  g_colors);
}
