function main() {

    Split(['#a', '#b'], {
        gutterSize: 8,
        cursor: 'col-resize',
        sizes: [75, 25],
        onDrag: () => { console.log('split resize raised!') }
    });

    $("#tabs").tabs({heightStyle: "fill"});


    SciViFSGraph.main($('#view')[0], $('#control')[0], g_data, g_colors);
}