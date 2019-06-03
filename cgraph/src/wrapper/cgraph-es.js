
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
var Louvain = require("../../filters/louvain/src/louvain.js");

var SciViCGraph = require("../../build/scivi-cgraph.js");

module.exports = CGraph;

function CGraph()
{
}

CGraph.prototype.parse = function (data)
{
    var parser = new SciViCGraph.Parser(data);
    return parser.graphStates;
}

CGraph.prototype.parseStates = function (data)
{
    var parser = new SciViCGraph.StatesParser(data);
    return parser.graphStates;
}

CGraph.prototype.parseStatesHierarchy = function (data)
{
    var parser = new SciViCGraph.HierarchicalStatesParser(data);
    return parser.graphStates;
}

CGraph.prototype.parseDynamicStates = function (data)
{
    var parser = new SciViCGraph.DynamicStatesParser(data);
    return parser.graphStates;
}

CGraph.prototype.createScale = function (steps, colors, textColors, names, getValue)
{
    return new SciViCGraph.Scale(steps, colors, textColors, names, getValue);
}

CGraph.prototype.createClassifier = function (tree, getKlass)
{
    return new SciViCGraph.Classifier(tree, getKlass);
}

CGraph.prototype.run = function (loc, data, scales, colors, title, info, classifier, container)
{
    var splitGraph = $("<div>");
    var split1G, splitS, stateLine;

    splitGraph.attr("id", "scivi_cgraph_a");
    splitGraph.css("height", "100%");
    splitGraph.css("width", "100%");

    if (data.hasStates) {
        splitG = $("<div>");
        splitS = $("<div>");

        splitG.attr("id", "scivi_cgraph_a1");
        splitG.attr("class", "split split-vertical");
        splitS.attr("id", "scivi_cgraph_a2");
        splitS.attr("class", "split split-vertical");

        stateLine = $("<div>");
        stateLine.attr("id", "scivi_cgraph_stateline");
        splitS.append(stateLine);

        splitGraph.append(splitG);
        splitGraph.append(splitS);
    } else {
        splitG = splitGraph;
        stateLine = null
    }

    if (title)
        splitG.html("<div id=\"scivi_cgraph_title\">" + title + "</div><div id=\"scivi_cgraph_view\" style=\"height: calc(100% - 30px)\"></div>");
    else
        splitG.html("<div id=\"scivi_cgraph_view\"></div>");

    $(container).prepend(splitGraph);

    var renderer = new SciViCGraph.Renderer($("#scivi_cgraph_view")[0], null,
                                            null, null,
                                            null, null,
                                            data.hasStates ? $("#scivi_cgraph_stateline")[0] : null,
                                            null,
                                            loc);

    if (data.hasStates) {
        var h = (data.stateLines.length * 50.0 + 16.0) / $(window).height() * 100.0;
        Split(["#scivi_cgraph_a1", "#scivi_cgraph_a2"], {
            gutterSize: 8,
            cursor: "row-resize",
            direction: "vertical",
            sizes: [100.0 - h, h],
            minSize: [30, 30],
            onDrag: function () { renderer.reshape(); }
        });
    }

    colors = colors || [0x00aa00, 0x0000aa, 0x00aaaa, 0xe6194b,
                        0x3cb44b, 0x0082c8, 0x911eb4, 0x46f0f0,
                        0xf032e6, 0xd2f53c, 0xfabebe, 0x008080,
                        0xe6beff, 0xaa6e28, 0xfffac8, 0x800000,
                        0xaaffc3, 0x808000, 0xffd8b1, 0x000080,
                        0x808080, 0xff0000, 0x00ff00, 0x0000ff,
                        0xff00ff, 0xffff00, 0x00ffff];

    renderer.setInput(data, colors);
    renderer.setColorPicker(ColorPicker);
    renderer.addModularityFilter(Louvain);
    if (classifier) {
        renderer.scaleLevels = classifier.generateScaleLevels();
        renderer.classifier = classifier;
    } else {
        renderer.scaleLevels = scales;
    }
    renderer.sortNodesByRingScale(true);
    renderer.run();
    renderer.reshape();

    return renderer;
}
