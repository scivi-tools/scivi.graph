if (!window.$)
    window.$ = require("jquery");
if (!window.jQuery)
    window.jQuery = $;
if (!window.$.ui) {
    require("jquery-ui/ui/core");
    require("jquery-ui/ui/widget");
}
if (!window.$.ui.mouse)
    require("jquery-ui/ui/mouse");
if (!window.$.ui.slider)
    require("jquery-ui/ui/slider");
if (!window.$.ui.tabs)
    require("jquery-ui/ui/tabs");
if (!window.$.contextMenu)
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
    CGraph.prototype.nodesTabVisible = true;
    CGraph.prototype.filtersTabVisible = true;
    CGraph.prototype.clustersTabVisible = true;
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

CGraph.prototype.loadFilterSet = function (filterSet)
{
    this.renderer.loadFilterSet(filterSet);
}

CGraph.prototype.colorWithHSV = function (h, s, v)
{
    return SciViCGraph.Color.hsv2rgb([h, s, v]);
}

CGraph.prototype.maxContrastColor = function (color)
{
    return SciViCGraph.Color.maxContrast(color);
}

CGraph.prototype.reshape = function ()
{
    if (this.graphContainer) {
        if (this.graphContainer.width() <= this.graphContainer.height())
            this.graphSplit.collapse(1);
        this.renderer.reshape();
    }
}

CGraph.prototype.run = function (loc, data, scales, colors, title, info, classifier, container)
{
    container = container || "body";

    var splitGraph = $("<div>");
    var split1G, splitS, stateLine;
    var graphContainer = $(container);

    splitGraph.attr("id", "scivi_cgraph_a");
    splitGraph.attr("class", "split split-horizontal");

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

    var splitInfo = $("<div>").html(
        "<div id=\"scivi_cgraph_tabs\">" +
        "    <ul>" +
        "        <li><a href=\"#scivi_cgraph_info\">" + loc["LOC_INFO"] + "</a></li>" +
        (this.nodesTabVisible ? "        <li><a href=\"#scivi_cgraph_list\">" + loc["LOC_NODES"] + "</a></li>" : "") +
        "        <li><a href=\"#scivi_cgraph_settings\">" + loc["LOC_SETTINGS"] + "</a></li>" +
        (this.filtersTabVisible ? "        <li><a href=\"#scivi_cgraph_filters\">" + loc["LOC_FILTERS"] + "</a></li>" : "") +
        (this.clustersTabVisible ? "        <li><a href=\"#scivi_cgraph_stats\">" + loc["LOC_GROUPS"] + "</a></li>" : "") +
        (classifier ? "        <li><a href=\"#scivi_cgraph_tree\">" + loc["LOC_TREE"] + "</a></li>" : "") +
        (data.hasStates ? "        <li><a href=\"#scivi_cgraph_calc\">" + loc["LOC_CALCULATOR"] + "</a></li>" : "") +
        (info ? "        <li><a href=\"#scivi_cgraph_ginfo\">" + loc["LOC_GINFO"] + "</a></li>" : "") +
        "    </ul>" +
        "    <div id=\"scivi_cgraph_info\"></div>" +
        (this.nodesTabVisible ? "    <div id=\"scivi_cgraph_list\"></div>" : "") +
        "    <div id=\"scivi_cgraph_settings\"></div>" +
        (this.filtersTabVisible ? "    <div id=\"scivi_cgraph_filters\"></div>" : "") +
        (this.clustersTabVisible ? "    <div id=\"scivi_cgraph_stats\"></div>" : "") +
        "    <div id=\"scivi_cgraph_tree\"></div>" +
        "    <div id=\"scivi_cgraph_calc\"></div>" +
        (info ? "    <div id=\"scivi_cgraph_ginfo\">" + info + "</div>" : "") +
        "</div>"
    );
    splitInfo.attr("id", "scivi_cgraph_b");
    splitInfo.attr("class", "split split-horizontal");

    graphContainer.prepend(splitInfo);
    graphContainer.prepend(splitGraph);

    var renderer = new SciViCGraph.Renderer($("#scivi_cgraph_view")[0],
                                            $("#scivi_cgraph_info")[0],
                                            this.nodesTabVisible ? $("#scivi_cgraph_list")[0] : null,
                                            $("#scivi_cgraph_settings")[0],
                                            this.filtersTabVisible ? $("#scivi_cgraph_filters")[0] : null,
                                            this.clustersTabVisible ?  $("#scivi_cgraph_stats")[0] : null,
                                            data.hasStates ? $("#scivi_cgraph_stateline")[0] : null,
                                            classifier ? $("#scivi_cgraph_tree")[0] : null, 
                                            data.hasStates ? $("#scivi_cgraph_calc")[0] : null,
                                            loc);

    if (data.hasStates) {
        var h = (data.stateLines.length * 50.0 + 16.0) / graphContainer.height() * 100.0;
        Split(["#scivi_cgraph_a1", "#scivi_cgraph_a2"], {
            gutterSize: 8,
            cursor: "row-resize",
            direction: "vertical",
            sizes: [100.0 - h, h],
            minSize: [100, 0],
            onDrag: function () { renderer.reshape(); }
        });
    }

    var graphSplit = Split(["#scivi_cgraph_a", "#scivi_cgraph_b"], {
        gutterSize: 8,
        cursor: "col-resize",
        minSize: [100, 0],
        onDrag: function () { renderer.reshape(); }
    });

    if (graphContainer.width() <= graphContainer.height())
        graphSplit.collapse(1);

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
    renderer.addModularityFilter(Louvain);
    if (classifier) {
        renderer.scaleLevels = classifier.generateScaleLevels();
        renderer.classifier = classifier;
    } else {
        renderer.scaleLevels = scales;
    }
    renderer.sortNodesByRingScale(true);
    renderer.run();

    this.renderer = renderer;
    this.graphContainer = graphContainer;
    this.graphSplit = graphSplit;

    return renderer;
}
