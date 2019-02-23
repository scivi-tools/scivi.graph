namespace SciViCGraph
{
    export class Classifier
    {
        constructor(private m_tree: any, public getKlass: (node: Node) => number)
        {
            // nop
        }

        private repeatStr(str: string, n: number)
        {
            let result = "";
            for (let i = 0; i < n; ++i)
                result += str;
            return result;
        }

        private findNodeByKlass(root: any, klass: number, steps: number[]): any
        {
            if (root["klass"] === klass)
                return root;
            else {
                ++steps[0];
                if (root["children"]) {
                    const children = root["children"];
                    for (let i = 0, n = children.length; i < n; ++i) {
                        const result = this.findNodeByKlass(children[i], klass, steps);
                        if (result)
                            return result;
                    }
                }
                return null;
            }
        }

        private stepsToKlass(klass: number): number
        {
            let steps = [0];
            this.findNodeByKlass(this.m_tree, klass, steps);
            return steps[0];
        }

        private buildTreeLevels(root: any, levels: any[], depth: number, hueFrom: number, hueTo: number): number[]
        {
            if (levels.length < depth)
                levels.push([]);
            levels[depth - 1].push(root);
            root["klasses"] = [];
            if (root["klass"])
                root["klasses"].push(root["klass"]);
            if (!root["color"]) {
                root["color"] = Color.hsv2rgb([levels[depth - 1].length % 2 ? (hueFrom + hueTo) / 2 : 360 - (hueFrom + hueTo) / 2,
                                              depth % 2 ? 40 : 80,
                                              levels[depth - 1].length % 2 ? 60 : 90]);
            }
            if (!root["textColor"]) {
                root["textColor"] = Color.maxContrast(root["color"]);
            }
            if (root["children"]) {
                const children = root["children"];
                const hStep = (hueTo - hueFrom) / children.length;
                for (let i = 0, n = children.length; i < n; ++i) {
                    const hF = hueFrom + i * hStep;
                    const hT = hF + hStep;
                    const chKlasses = this.buildTreeLevels(children[i], levels, depth + 1, hF, hT);
                    root["klasses"] = root["klasses"].concat(chKlasses);
                }
            }
            return root["klasses"];
        }

        private buildTreeStructure(root: any, depth: number): string
        {
            let result;
            const isLeaf = !root["children"] || root["children"].length === 0;
            if (root["name"]) {
                if (root["klass"]) {
                    if (isLeaf)
                        result = "<li data-id='" + root["klass"] + "'>" + this.repeatStr("-", depth) + root["name"] + "</li>";
                    else {
                        result = "<li data-id='-1'>" + this.repeatStr("-", depth) + root["name"] + "</li>";
                        result += "<li data-id='" + root["klass"] + "'>" + this.repeatStr("-", depth + 1) + root["name"] + "</li>";
                    }
                } else {
                    result = "<li data-id='-1'>" + this.repeatStr("-", depth) + root["name"] + "</li>";
                }
            } else {
                --depth;
            }
            if (!isLeaf) {
                const children = root["children"];
                for (let i = 0, n = children.length; i < n; ++i)
                    result += this.buildTreeStructure(children[i], depth + 1);
            }
            return result;
        }

        public sortNodes(nodes: Node[])
        {
            nodes.sort((n1, n2) => {
                let c = this.stepsToKlass(this.getKlass(n1)) - this.stepsToKlass(this.getKlass(n2));
                if (c === 0)
                    return n1.label.localeCompare(n2.label);
                else
                    return c;
            });
        }

        public generateScaleLevels(): Scale[]
        {
            let treeLevels = [];
            this.buildTreeLevels(this.m_tree, treeLevels, 1, 0, 360);
            let result = [];
            // We skip topmost root, coz it makes no sense to draw it on the ring scale: it will look like solid ring,
            // bringing no information and just wasting space.
            for (let i = treeLevels.length - 1; i > 0; --i) {
                let klasses = [];
                let names = [];
                let colors = [];
                let textColors = [];
                treeLevels[i].forEach((treeNode) => {
                    klasses.push(treeNode["klasses"]);
                    names.push(treeNode["name"]);
                    colors.push(treeNode["color"]);
                    textColors.push(treeNode["textColor"]);
                });
                result.push(new DiscreteScale(klasses, colors, textColors, names, this.getKlass));
            }
            return result;
        }

        public initTreeView(treeView: HTMLElement, svRenderer: Renderer)
        {
            // HINT: it's better to generate the full html. Yes, it's more complicated, but more efficient.
            // And then we can remove the crutch from the hummingbird-treeview.js with the checked state of inputs.
            let div = $("<div>", { "class": "hummingbird-treeview-converter", "data-height": "500px" });
            div.html(this.buildTreeStructure(this.m_tree, 0));
            treeView.appendChild(div[0]);
            $.fn.hummingbird.convert();
            $("#treeview").hummingbird();
            $("#treeview").on("CheckUncheckDone", () => {
                let list = {"id" : [], "dataid" : [], "text" : []};
                $("#treeview").hummingbird("getChecked", { list: list, onlyEndNodes: false });
                Object.keys(svRenderer.states.data).forEach((dataKey) => {
                    const data = svRenderer.states.data[dataKey];
                    data.forEach((state) => {
                        state.excludeUnselected(list["dataid"], this.getKlass);
                    });
                });
                svRenderer.updateNodeKlasses();
            });
        }
    }
}
