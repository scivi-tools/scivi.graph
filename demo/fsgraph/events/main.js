function main() {
    var controller = SciViFSGraph.GraphController.fromJson(g_data);
    var renderer = null;

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
            renderer.angleDegrees = ui.value;
        }
    });

    renderer = new SciViFSGraph.VivaWebGLRenderer($('#view')[0]);
    
    renderer.graphController = controller;
    renderer.run(1000);

    window.mygraphics = renderer.graphics;
    window.myctrl = controller;
    //  g_colors);
}
