function main() {
    var controller = SciViFSGraph.GraphController.fromJson(g_data);
    var viewRules = new SciViFSGraph.VivaStateView();
    viewRules.onNodeRender = (nodeUI) => {
        nodeUI._span.hidden = nodeUI.node.data.groupId !== 0;
        var domPos = { x: nodeUI.position.x, y: nodeUI.position.y };
        renderer.graphics.transformGraphToClientCoordinates(domPos);
        nodeUI._span.style.left = domPos.x + 'px';
        nodeUI._span.style.top = domPos.y + 'px';
    };
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
    renderer.viewRules = viewRules;
    renderer.run(1000);

    window.mygraphics = renderer.graphics;
    window.myctrl = controller;
    //  g_colors);
}
