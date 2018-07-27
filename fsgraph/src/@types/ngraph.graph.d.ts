// @ts-check
/// <reference path="./ngraph.events.d.ts" />

declare namespace NgraphGraph {

    export type ElementId = any;
    export type Position = {
        x: number,
        y: number,
        z?: number
    };
    export type Position2 = {
        from: Position,
        to: Position
    };

    export type Link = {
        id: ElementId,
        fromId: ElementId,
        toId: ElementId,
        data?: any,
        [_: string]: any
    };

    export type Node = {
        id: ElementId,
        links: Link[],
        data?: any,
        position? : Position,
        [_: string]: any
    };

    export type NodeCallback = (Node) => boolean;
    export type LinkCallback = (Link) => boolean;

    export interface Graph extends NgraphEvents.EventifiedObject<Graph> {
        addNode(id: ElementId, data?: any) : Node,
        addLink(fromId: ElementId, toId: ElementId, data?: any) : Link,
        removeLink(link: Link) : boolean,
        removeNode(id: ElementId) : boolean,
        getNode(id: ElementId) : Node,
        getNodesCount() : number,
        getLinksCount() : number,
        getLinks(nodeId: ElementId) : Link[],
        forEachNode(nodeCallback : NodeCallback) : void,
        forEachLinkedNode(id: ElementId, nodeCallback : NodeCallback) : void,
        forEachLink(linkCallback : LinkCallback) : void,
        clear() : void,
        hasLink(fromId : ElementId, toId : ElementId) : Link,
        getLink(fromId : ElementId, toId : ElementId) : Link,
        beginUpdate() : void,
        endUpdate() : void
    }
}

declare function NgraphGraph(options? : {uniqueLinkId? : boolean}) : NgraphGraph.Graph;

declare module 'ngraph.graph' {
    export = NgraphGraph;
}
