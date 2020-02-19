/// <reference path="./ngraph.generic.d.ts" />

declare namespace VivaGeneric {

    export interface NodeUI {
        id: number,
        position: Ngraph.Graph.Position,
        drawPosition: Ngraph.Graph.Position,
        labelDirection: Ngraph.Graph.Position,
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
        bringToFront(node: NodeUI) : void,
        getFrontNodeId(groupId: number) : number
    }

    export interface LinkProgram extends Program {
        position(nodeUI: LinkUI, fromPos: Ngraph.Graph.Position, toPos: Ngraph.Graph.Position) : void,
        createLink(ui: LinkUI) : void,
        removeLink(ui: LinkUI) : void
    }

    export interface WebGlOpts {
        enableBlending: boolean,
        preserveDrawingBuffer: boolean,
        clearColor: boolean,
        clearColorValue: {
            r: number,
            g: number,
            b: number,
            a: number
        }
    }

    export interface WebGlGraphics<NodeT extends NodeUI, LinkT extends LinkUI> {
        getLinkUI(linkId: number): LinkT;
        getNodeUI(nodeId: number): NodeT;

        /**
         * Sets the callback that creates node representation.
         *
         * @param builderCallback a callback function that accepts graph node
         * as a parameter and must return an element representing this node.
         *
         * @returns If builderCallbackOrNode is a valid callback function, instance of this is returned;
         * Otherwise undefined value is returned
         */
        node(builderCallback: (node: Ngraph.Graph.Node) => NodeT): WebGlGraphics<NodeT, LinkT>;

        /**
         * Sets the callback that creates link representation
         *
         * @param builderCallback a callback function that accepts graph link
         * as a parameter and must return an element representing this link.
         *
         * @returns If builderCallback is a valid callback function, instance of this is returned;
         * Otherwise undefined value is returned.
         */
        link(builderCallback: (link: Ngraph.Graph.Link) => LinkT): WebGlGraphics<NodeT, LinkT>;


        /**
         * Allows to override default position setter for the node with a new
         * function. newPlaceCallback(nodeUI, position) is function which
         * is used by updateNodePosition().
         */
        placeNode(newPlaceCallback: (node: NodeT, pos: Ngraph.Graph.Position) => void): WebGlGraphics<NodeT, LinkT>;

        placeLink(newPlaceLinkCallback: (link: LinkT, pos: Ngraph.Graph.Position2) => void): WebGlGraphics<NodeT, LinkT>;

        /**
         * Custom input manager listens to mouse events to process nodes drag-n-drop inside WebGL canvas
         */
        // TODO: implement such a interface
        inputManager : any;

        webglInputEvents?: WebGlInputEvents<NodeT>;

        /**
         * Called every time before renderer starts rendering.
         */
        beginRender(): void;

        /**
         * Called every time when renderer finishes one step of rendering.
         */
        endRender(): void;

        bringLinkToFront(linkUI: LinkT): void;

        bringNodeToFront(nodeUI: NodeT) : void;

        /**
         * Sets translate operation that should be applied to all nodes and links.
         */
        graphCenterChanged(x: number, y: number): void;

        /**
         * Called by Viva.Graph.View.renderer to let concrete graphic output
         * provider prepare to render given link of the graph
         */
        addLink(link: Ngraph.Graph.Link, boundPosition: Ngraph.Graph.Position2): NodeT;

        /**
         * Called by Viva.Graph.View.renderer to let concrete graphic output
         * provider prepare to render given node of the graph.
         */
        addNode(node: Ngraph.Graph.Node, boundPosition: Ngraph.Graph.Position): NodeT;

        translateRel(dx: number, dy: number): void;

        scale(scaleFactor: number, scrollPoint: Ngraph.Graph.Position): number;

        getScaleFactor() : number;

        getRotationAngle() : number;

        resetScale(): WebGlGraphics<NodeT, LinkT>;

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
        getGraphicsRoot(callbackWhenReady?: (container: HTMLCanvasElement) => void): HTMLCanvasElement;

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

        getNodeAtClientPos(clientPos: Ngraph.Graph.Position, preciseCheck: (node: NodeT, x: number, y: number) => boolean): NodeT | null;

        rotate(angle: number): void;

        getTransform(): number[];

        pixelRatio(): number;
    }

    export interface WebGlInputEvents<NodeT extends NodeUI> {
        mouseEnter(callback: (node: NodeT) => boolean): void;
        mouseLeave(callback: (node: NodeT) => boolean): WebGlInputEvents<NodeT>;
        mouseDown(callback: (node: NodeT, e: MouseEvent) => boolean): WebGlInputEvents<NodeT>;
        mouseUp(callback: (node: NodeT, e: MouseEvent) => boolean): WebGlInputEvents<NodeT>;
        mouseMove(callback: (node: NodeT, e: MouseEvent) => boolean): WebGlInputEvents<NodeT>;
        click(callback: (node: NodeT, e: MouseEvent) => boolean): WebGlInputEvents<NodeT>;
        dblClick(callback: (node: NodeT, e: MouseEvent) => boolean): WebGlInputEvents<NodeT>;
        mouseCapture(node: NodeT): void;
        releaseMouseCapture(node: NodeT): void;
    }

    export function TimerBuilder(callback: () => boolean) : Timer;
    export interface Timer {
        stop(): void;
        restart(): void;
    }
}
