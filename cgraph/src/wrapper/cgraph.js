
window.$ = require("jquery");
window.jQuery = $;
require("jquery-ui/ui/core");
require("jquery-ui/ui/widget");
require("jquery-ui/ui/mouse");
require("jquery-ui/ui/slider");
require("jquery-ui/ui/tabs");
require("jquery-contextmenu");
var PIXI = require("pixi.js");
var Split = require("split.js");
require("chart.js");
var ColorPicker = require("vanilla-picker");

var SciViCGraph = require("../../build/scivi-cgraph.js");

module.exports = CGraph;

function CGraph()
{
}

CGraph.prototype.parse = function (data)
{
    var parser = new SciViCGraph.Parser(data);
    return parser.graphData;
}

CGraph.prototype.parseStates = function (data)
{
    var parser = new SciViCGraph.StatesParser(data);
    return parser.graphDataStates;
}

CGraph.prototype.createScale = function (steps, colors, textColors, names, getValue)
{
    return new SciViCGraph.Scale(steps, colors, textColors, names, getValue);
}

CGraph.prototype.run = function (loc, data, scales, colors, title, info)
{
    var split1 = $("<div>");
    if (title) {
        if (data.length > 1)
            split1.html("<div id=\"scivi_cgraph_title\">" + title + "</div><div id=\"scivi_cgraph_view\" style=\"height: calc(100vh - 100px);\"></div><div id=\"scivi_cgraph_stateline\"></div>");
        else
            split1.html("<div id=\"scivi_cgraph_title\">" + title + "</div><div id=\"scivi_cgraph_view\" style=\"height: calc(100vh - 30px);\"></div>");
    } else {
        if (data.length > 1)
            split1.html("<div id=\"scivi_cgraph_view\" style=\"height: calc(100vh - 70px);\"></div><div id=\"scivi_cgraph_stateline\"></div>");
        else
            split1.html("<div id=\"scivi_cgraph_view\"></div>");
    }
    split1.attr("id", "scivi_cgraph_a");
    split1.attr("class", "split split-horizontal");

    var split2 = $("<div>").html(
        "<div id=\"scivi_cgraph_tabs\">" +
        "    <ul>" +
        "        <li><a href=\"#scivi_cgraph_info\">" + loc["LOC_INFO"] + "</a></li>" +
        "        <li><a href=\"#scivi_cgraph_list\">" + loc["LOC_NODES"] + "</a></li>" +
        "        <li><a href=\"#scivi_cgraph_settings\">" + loc["LOC_SETTINGS"] + "</a></li>" +
        "        <li><a href=\"#scivi_cgraph_filters\">" + loc["LOC_FILTERS"] + "</a></li>" +
        "        <li><a href=\"#scivi_cgraph_stats\">" + loc["LOC_GROUPS"] + "</a></li>" +
        (info ? "        <li><a href=\"#scivi_cgraph_ginfo\">" + loc["LOC_GINFO"] + "</a></li>" : "") +
        "    </ul>" +
        "    <div id=\"scivi_cgraph_info\"></div>" +
        "    <div id=\"scivi_cgraph_list\"></div>" +
        "    <div id=\"scivi_cgraph_settings\"></div>" +
        "    <div id=\"scivi_cgraph_filters\"></div>" +
        "    <div id=\"scivi_cgraph_stats\"></div>" +
        (info ? "    <div id=\"scivi_cgraph_ginfo\">" + info + "</div>" : "") +
        "</div>"
    );
    split2.attr("id", "scivi_cgraph_b");
    split2.attr("class", "split split-horizontal");

    $("body").prepend(split2);
    $("body").prepend(split1);

    var renderer = new SciViCGraph.Renderer($("#scivi_cgraph_view")[0], $("#scivi_cgraph_info")[0],
                                            $("#scivi_cgraph_list")[0], $("#scivi_cgraph_settings")[0],
                                            $("#scivi_cgraph_filters")[0], $("#scivi_cgraph_stats")[0],
                                            data.length > 1 ? $("#scivi_cgraph_stateline")[0] : null,
                                            loc);

    Split(["#scivi_cgraph_a", "#scivi_cgraph_b"], {
        gutterSize: 8,
        cursor: "col-resize",
        onDrag: function () { renderer.reshape(); }
    });

    $("#scivi_cgraph_tabs").tabs({heightStyle: "fill"});

    colors = colors || [0x00aa00, 0x0000aa, 0x00aaaa, 0xe6194b,
                        0x3cb44b, 0x0082c8, 0x911eb4, 0x46f0f0,
                        0xf032e6, 0xd2f53c, 0xfabebe, 0x008080,
                        0xe6beff, 0xaa6e28, 0xfffac8, 0x800000,
                        0xaaffc3, 0x808000, 0xffd8b1, 0x000080,
                        0x808080, 0xff0000, 0x00ff00, 0x0000ff,
                        0xff00ff, 0xffff00, 0x00ffff];

    renderer.setInput(data, colors);
    renderer.setColorPicker(ColorPicker);
    renderer.scaleLevels = scales;
    renderer.sortNodesByRingScale(true);
    renderer.run();

    return renderer;
}
