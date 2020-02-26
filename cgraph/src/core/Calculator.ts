namespace SciViCGraph
{
    export class Calculator
    {
        static readonly m_opUnion = "0";
        static readonly m_opIntersect = "1";
        static readonly m_opDiff = "2";
        static readonly m_opSymDiff = "3";

        private m_exprDiv: JQuery;
        private m_operands: JQuery[];
        private m_operations: JQuery[];

        constructor(private m_renderer: Renderer, private m_container: HTMLElement)
        {
            this.m_exprDiv = null;
            this.m_operands = null;
            this.m_operations = null;
        }

        private addFirstOperation()
        {
            this.m_operands = [];
            this.m_operations = [];
            const expr = $("<div>");
            expr.append(this.createOperandCombo());
            expr.append(this.createOperationCombo());
            expr.append(this.createOperandCombo());
            this.m_exprDiv.append(expr);
        }

        private addOperand()
        {
            const expr = $("<div>");
            expr.append(this.createOperationCombo());
            expr.append(this.createOperandCombo());
            this.m_exprDiv.append(expr);
        }

        private clean()
        {
            this.m_exprDiv.empty();
            this.addFirstOperation();
        }

        private stateFullName(stateKey: string): string
        {
            const indices = stateKey.split("|");
            let result = "";
            for (let i = 0, n = indices.length; i < n; ++i) {
                const ind = parseInt(indices[i]);
                result += this.m_renderer.states.stateLines[i][ind];
                if (i < n - 1)
                    result += " → ";
            }
            return result;
        }

        private createOperandCombo(): JQuery
        {
            const combo = $('<select id="combo">');
            Object.keys(this.m_renderer.states.data).forEach((dataKey) => {
                if (dataKey !== "calculated")
                    $('<option>', { value: dataKey, text: this.stateFullName(dataKey) }).appendTo(combo);
            });
            this.m_operands.push(combo);
            return combo;
        }

        private createOperationCombo(): JQuery
        {
            const combo = $('<select id="combo">');
            $('<option>', { value: Calculator.m_opIntersect, text: this.m_renderer.localizer["LOC_OPINTERSECT"] }).appendTo(combo);
            $('<option>', { value: Calculator.m_opDiff, text: this.m_renderer.localizer["LOC_OPDIFF"] }).appendTo(combo);
            $('<option>', { value: Calculator.m_opSymDiff, text: this.m_renderer.localizer["LOC_OPSYMDIFF"] }).appendTo(combo);
            $('<option>', { value: Calculator.m_opUnion, text: this.m_renderer.localizer["LOC_OPUNION"] }).appendTo(combo);
            this.m_operations.push(combo);
            return combo;
        }

        private getState(stateKey: string): GraphData
        {
            // TODO: handle dynamic states, see Renderer.currentData for howto.
            return this.m_renderer.states.data[stateKey];
        }

        private findCorrespondingNode(node: Node, nodes: Node[]): Node
        {
            if (node) {
                for (let i = 0, n = nodes.length; i < n; ++i) {
                    if (nodes[i].label === node.label)
                        return nodes[i];
                }
            }
            return null;
        }

        private findCorrespondingEdge(src: Node, dst: Node, edges: Edge[]): Edge
        {
            if (src && dst) {
                for (let i = 0, n = edges.length; i < n; ++i) {
                    if ((edges[i].source.label === src.label) && (edges[i].target.label === dst.label))
                        return edges[i];
                }
            }
            return null;
        }

        private stateUnion(stateA: GraphData, stateB: GraphData): GraphData
        {
            const resultNodes = [];
            stateA.nodes.forEach((node) => {
                resultNodes.push(node.clone());
            });
            stateB.nodes.forEach((node) => {
                const corrNode = this.findCorrespondingNode(node, resultNodes);
                if (corrNode)
                    corrNode.custom["weight"] = Math.max(corrNode.weight, node.weight);
                else
                    resultNodes.push(node.clone(resultNodes.length));
            });

            const resultEdges = [];
            stateA.edges.forEach((edge) => {
                const src = this.findCorrespondingNode(edge.source, resultNodes);
                const dst = this.findCorrespondingNode(edge.target, resultNodes);
                resultEdges.push(new Edge(src, dst, edge.weight, null));
            });
            stateB.edges.forEach((edge) => {
                const src = this.findCorrespondingNode(edge.source, resultNodes);
                const dst = this.findCorrespondingNode(edge.target, resultNodes);
                const corrEdge = this.findCorrespondingEdge(src, dst, resultEdges);
                if (corrEdge)
                    corrEdge.weight = Math.max(corrEdge.weight, edge.weight);
                else
                    resultEdges.push(new Edge(src, dst, edge.weight, null));
            });

            return new GraphData(resultNodes, resultEdges);
        }

        private stateIntersect(stateA: GraphData, stateB: GraphData): GraphData
        {
            const resultNodes = [];
            stateA.nodes.forEach((node) => {
                const corrNode = this.findCorrespondingNode(node, stateB.nodes);
                if (corrNode) {
                    const newNode = node.clone();
                    newNode.custom["weight"] = Math.min(node.weight, corrNode.weight);
                    resultNodes.push(newNode);
                }
            });

            const resultEdges = [];
            stateA.edges.forEach((edge) => {
                const src = this.findCorrespondingNode(edge.source, resultNodes);
                const dst = this.findCorrespondingNode(edge.target, resultNodes);
                const corrEdge = this.findCorrespondingEdge(src, dst, stateB.edges);
                if (corrEdge)
                    resultEdges.push(new Edge(src, dst, Math.min(edge.weight, corrEdge.weight), null));
            });

            return new GraphData(resultNodes, resultEdges);
        }

        private stateDiff(stateA: GraphData, stateB: GraphData): GraphData
        {
            const resultNodes = [];
            stateA.nodes.forEach((node) => {
                const newNode = node.clone();
                const corrNode = this.findCorrespondingNode(node, stateB.nodes);
                if (corrNode)
                    newNode.custom["weight"] = Math.max(newNode.weight - corrNode.weight, 0);
                resultNodes.push(newNode);
            });

            const resultEdges = [];
            stateA.edges.forEach((edge) => {
                const src = this.findCorrespondingNode(edge.source, resultNodes);
                const dst = this.findCorrespondingNode(edge.target, resultNodes);
                const corrEdge = this.findCorrespondingEdge(src, dst, stateB.edges);
                if (!corrEdge)
                    resultEdges.push(new Edge(src, dst, edge.weight, null));
            });

            return new GraphData(resultNodes, resultEdges);
        }

        private stateSymDiff(stateA: GraphData, stateB: GraphData): GraphData
        {
            return this.stateDiff(this.stateUnion(stateA, stateB), this.stateIntersect(stateA, stateB));
        }

        private calculate()
        {
            let result = this.getState(this.m_operands[0].val());
            for (let i = 0, n = this.m_operations.length; i < n; ++i) {
                switch (this.m_operations[i].val()) {
                    case Calculator.m_opUnion:
                        result = this.stateUnion(result, this.getState(this.m_operands[i + 1].val()));
                        break;

                    case Calculator.m_opIntersect:
                        result = this.stateIntersect(result, this.getState(this.m_operands[i + 1].val()));
                        break;

                    case Calculator.m_opDiff:
                        result = this.stateDiff(result, this.getState(this.m_operands[i + 1].val()));
                        break;

                    case Calculator.m_opSymDiff:
                        result = this.stateSymDiff(result, this.getState(this.m_operands[i + 1].val()));
                        break;
                }
            }
            this.m_renderer.states.data["calculated"] = result;
            this.m_renderer.changeCurrentStateToCalculated();
        }

        public build()
        {
            if (this.m_container)
            {
                this.m_exprDiv = $("<div>");
                $(this.m_container).append(this.m_exprDiv);

                const br = $("<br>");
                $(this.m_container).append(br);                

                this.addFirstOperation();

                const addOpBtn = $("<div>").attr({ class: "scivi_button" });
                addOpBtn.html(this.m_renderer.localizer["LOC_ADDOPERAND"]);
                addOpBtn.click(() => {
                    this.addOperand();
                });
                $(this.m_container).append(addOpBtn);

                const calcBtn = $("<div>").attr({ class: "scivi_button" });
                calcBtn.html(this.m_renderer.localizer["LOC_CALCULATE"]);
                calcBtn.click(() => {
                    this.calculate();
                });
                $(this.m_container).append(calcBtn);

                const cleanBtn = $("<div>").attr({ class: "scivi_button" });
                cleanBtn.html(this.m_renderer.localizer["LOC_CLEANCALC"]);
                cleanBtn.click(() => {
                    this.clean();
                });
                $(this.m_container).append(cleanBtn);
            }
        }
    }
}
