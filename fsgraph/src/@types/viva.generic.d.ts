/// <reference path="./ngraph.generic.d.ts" />

declare namespace VivaGeneric {

    export interface NodeUI {
        id: number,
        position: Ngraph.Graph.Position,
        node: Ngraph.Graph.Node
    }

    export interface LinkUI {
        id: number,
        pos: Ngraph.Graph.Position2,
        link: Ngraph.Graph.Link
    }

    export interface Program {
        load(glContext: WebGLRenderingContext) : void,
        updateTransform(newTransform: number[]) : void,
        updateSize(w: number, h:number) : void,
        render() : void
    }

    export interface NodeProgram extends Program {
        position(nodeUI: NodeUI, pos: Ngraph.Graph.Position) : void,
        createNode(ui: NodeUI) : void,
        removeNode(ui: NodeUI) : void,
        replaceProperties(replacedNode: NodeUI, newNode: NodeUI) : void
    }

    export interface LinkProgram extends Program {
        position(nodeUI: LinkUI, fromPos: Ngraph.Graph.Position, toPos: Ngraph.Graph.Position) : void,
        createLink(ui: LinkUI) : void,
        removeLink(ui: LinkUI) : void
    }

    export interface WebGlOpts {
        enableBlending?: boolean,
        preserveDrawingBuffer?: boolean,
        clearColor?: boolean,
        clearColorValue?: {
            r: number,
            g: number,
            b: number,
            a: number
        }
    }

    export interface WebGlGraphics {
        getLinkUI(linkId: number): LinkUI;
        getNodeUI(nodeId: number): NodeUI;

        /**
         * Sets the callback that creates node representation.
         *
         * @param builderCallback a callback function that accepts graph node
         * as a parameter and must return an element representing this node.
         *
         * @returns If builderCallbackOrNode is a valid callback function, instance of this is returned;
         * Otherwise undefined value is returned
         */
        node(builderCallback: (node: Ngraph.Graph.Node) => NodeUI): WebGlGraphics;

        /**
         * Sets the callback that creates link representation
         *
         * @param builderCallback a callback function that accepts graph link
         * as a parameter and must return an element representing this link.
         *
         * @returns If builderCallback is a valid callback function, instance of this is returned;
         * Otherwise undefined value is returned.
         */
        link(builderCallback: (link: Ngraph.Graph.Link) => LinkUI): WebGlGraphics;


        /**
         * Allows to override default position setter for the node with a new
         * function. newPlaceCallback(nodeUI, position) is function which
         * is used by updateNodePosition().
         */
        placeNode(newPlaceCallback: (node: NodeUI, pos: Ngraph.Graph.Position) => void): WebGlGraphics;

        placeLink(newPlaceLinkCallback: (link: LinkUI, pos: Ngraph.Graph.Position2) => void): WebGlGraphics;

        /**
         * Custom input manager listens to mouse events to process nodes drag-n-drop inside WebGL canvas
         */
        // TODO: implement such a interface
        inputManager : any;

        /**
         * Called every time before renderer starts rendering.
         */
        beginRender(): void;

        /**
         * Called every time when renderer finishes one step of rendering.
         */
        endRender(): void;

        bringLinkToFront(linkUI: LinkUI): void;

        /**
         * Sets translate operation that should be applied to all nodes and links.
         */
        graphCenterChanged(x: number, y: number): void;

        /**
         * Called by Viva.Graph.View.renderer to let concrete graphic output
         * provider prepare to render given link of the graph
         */
        addLink(link: Ngraph.Graph.Link, boundPosition: Ngraph.Graph.Position2): LinkUI;

        /**
         * Called by Viva.Graph.View.renderer to let concrete graphic output
         * provider prepare to render given node of the graph.
         */
        addNode(node: Ngraph.Graph.Node, boundPosition: Ngraph.Graph.Position): NodeUI;

        translateRel(dx: number, dy: number): void;

        scale(scaleFactor: number, scrollPoint: Ngraph.Graph.Position): number;

        resetScale(): WebGlGraphics;

       /**
        * Resizes the graphic without resetting the scale. 
        * Useful with viva graph in a dynamic container
        */
        updateSize(): void;

       /**
        * Called by Viva.Graph.View.renderer to let concrete graphic output
        * provider prepare to render.
        */
        init(c: HTMLElement): void;

        /**
        * Called by Viva.Graph.View.renderer to let concrete graphic output
        * provider release occupied resources.
        */
        release(container: HTMLElement): void;

       /**
        * Checks whether webgl is supported by this browser.
        */
        isSupported(): WebGLRenderingContext;

       /**
        * Called by Viva.Graph.View.renderer to let concrete graphic output
        * provider remove link from rendering surface.
        **/
        releaseLink(link: Ngraph.Graph.Link): void;

       /**
        * Called by Viva.Graph.View.renderer to let concrete graphic output
        * provider remove node from rendering surface.
        **/
        releaseNode(node: Ngraph.Graph.Node): void;

        renderNodes(): void;

        renderLinks(): void;

        /**
         * Returns root element which hosts graphics.
         */
        getGraphicsRoot(callbackWhenReady: (containre: HTMLCanvasElement) => void): HTMLCanvasElement;

        /**
         * Updates default shader which renders nodes
         */
        setNodeProgram(newProgram: NodeProgram): void;

        /**
         * Updates default shader which renders links
         */
        setLinkProgram(newProgram: LinkProgram): void;

        /**
         * Transforms client coordinates into layout coordinates. Client coordinates
         * are DOM coordinates relative to the rendering container. Layout
         * coordinates are those assigned by by layout algorithm to each node.
         *
         * @param p - a point object with `x` and `y` attributes.
         * This method mutates p.
         */
        transformClientToGraphCoordinates(p: Ngraph.Graph.Position): Ngraph.Graph.Position;

        /**
         * Transforms WebGL coordinates into client coordinates. Reverse of 
         * `transformClientToGraphCoordinates()`
         *
         * @param p - a point object with `x` and `y` attributes, which
         * represents a layout coordinate. This method mutates p.
         */
        transformGraphToClientCoordinates(p: Ngraph.Graph.Position): Ngraph.Graph.Position;

        // TODO: declare precieseCheck callback properly
        getNodeAtClientPos(clientPos: Ngraph.Graph.Position, preciseCheck: (arg0: any, arg1: any, arg2: any) => boolean): VivaGeneric.NodeUI | null;

        rotate(angle: number): void;

        getTransform(): number[];

        pixelRatio(): number;
    }
}
