/**
 * @fileOverview Defines a graph renderer that uses WebGL based drawings.
 *
 * @author Andrei Kashcha (aka anvaka) / https://github.com/anvaka
 */

import { newLinkProgram } from './newLinkProgram'
import { newNodeProgram } from './newNodeProgram'
import * as eventify from 'ngraph.events';
import merge from 'ngraph.merge';
import {SelectionMode} from "../SelectionMode";

export const maxScaleRate = 2.0;
export const minScaleRate = 0.01;

/**
 * Performs webgl-based graph rendering. This module does not perform
 * layout, but only visualizes nodes and edges of the graph.
 *
 * @param {Partial<VivaGeneric.WebGlOpts>} opts - to customize graphics  behavior. Currently supported parameter
 *  enableBlending - true by default, allows to use transparency in node/links colors.
 *  preserveDrawingBuffer - false by default, tells webgl to preserve drawing buffer.
 *                    See https://www.khronos.org/registry/webgl/specs/1.0/#5.2
 * @returns {VivaGeneric.WebGlGraphics}
 */
export function webglGraphics(opts) {
    const options = merge(opts, {
        enableBlending : true,
        preserveDrawingBuffer : false,
        clearColor: false,
        clearColorValue : {
            r : 1,
            g : 1,
            b : 1,
            a : 1
        }
    });

    const realPixelRatio = window.devicePixelRatio || 1;
    /** @type {HTMLElement} */
    var container;
    /** @type {HTMLCanvasElement} */
    var graphicsRoot;
    /** @type {WebGLRenderingContext} */
    var gl;
    var MSAA_SampleCount = 4;
    var MSAA_Framebuffer;  //фреймбуфер с MSAA изображением сцены
    var MSAA_Texture;       //текстура в которую будем рендерить MSAA-сцену
    var intermediate_Framebuffer;   //фреймбуффер для сжатого изображения из рендербуфера, которое потом можно обработать
    var width,
        height,
        //scaleRate = [0.01, 2.0]
        scaleRate = 1.0,
        angle = 0.0,
        nodesCount = 0,
        linksCount = 0,
        transform = [],
        rotateIt = function (xx, yy, ang) {
            var cx = Math.cos(ang);
            var sy = Math.sin(ang);

            return [(xx * cx - yy * sy), (xx * sy + yy * cx)];
        },
        getTransformAngle = function () {
            return Math.atan2(transform[1], transform[0]);
        },
        userPlaceNodeCallback,
        userPlaceLinkCallback,
        nodes = [],
        userSelectedNodes = [], // список нод выделенных пользователем
        links = [],
        initCallback,

        allNodes = {},
        allLinks = {},
        linkProgram = newLinkProgram(),
        nodeProgram = newNodeProgram(),

        
        nodeUIBuilder =
        /**
         * @param {Ngraph.Graph.Node} node
         * @returns {VivaGeneric.NodeUI}
         */
        function (node) {
            console.log("No node UI builder!");
            return null;
        },

        
        linkUIBuilder =
        /**
         * @param {Ngraph.Graph.Link} link
         * @returns {VivaGeneric.LinkUI}
         */
        function (link) {
            console.log("No link UI builder!");
            return null;
        },
/*jshint unused: true */
        updateTransformUniform = function () {
            linkProgram.updateTransform(transform);
            nodeProgram.updateTransform(transform);
        },

        resetScaleInternal = function () {
            transform = [realPixelRatio, 0, 0, 0,
                        0, realPixelRatio, 0, 0,
                        0, 0, realPixelRatio, 0,
                        0, 0, 0, 1];
            scaleRate = realPixelRatio;
        },

        updateSize = function () {
            if (container && graphicsRoot) {
                width = Math.max(container.clientWidth, 1);
                height = Math.max(container.clientHeight, 1);
                graphicsRoot.style.width = `${width}px`;
                graphicsRoot.style.height = `${height}px`;
                graphicsRoot.width = width * MSAA_SampleCount;
                graphicsRoot.height = height * MSAA_SampleCount;
                //создаем текстуру в которую будем рендерить
                /*MSAA_Texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, MSAA_Texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    width * MSAA_SampleCount, height * MSAA_SampleCount,
                    0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                MSAA_Framebuffer = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, MSAA_Framebuffer);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, MSAA_Texture, 0);*/

                gl.viewport(0, 0, width * MSAA_SampleCount, height * MSAA_SampleCount);
                if (linkProgram) {
                    linkProgram.updateSize(width / 2, height / 2);
                }
                if (nodeProgram) {
                    nodeProgram.updateSize(width / 2, height / 2);
                }
            }
        },



        fireRescaled = function (graphics) {
            graphics.fire("rescaled");
        },

        scale = function (_scaleFactor, scrollPoint) {
            if (scaleRate <= 2 && scaleRate >= 0.01) {
                // Transform scroll point to clip-space coordinates:
                var cx = 2 * scrollPoint.x / width - 1,
                    cy = 1 - (2 * scrollPoint.y) / height;
                scaleRate *= _scaleFactor;
                if (scaleRate > maxScaleRate)
                {
                    scaleRate = maxScaleRate;
                    _scaleFactor = 1.0;
                }
                if (scaleRate < minScaleRate)
                {
                    scaleRate = minScaleRate;
                    _scaleFactor = 1.0;
                }
                cx -= transform[12];
                cy -= transform[13];

                transform[12] += cx * (1 - _scaleFactor);
                transform[13] += cy * (1 - _scaleFactor);

                transform[0] *= _scaleFactor;
                transform[1] *= _scaleFactor;
                transform[4] *= _scaleFactor;
                transform[5] *= _scaleFactor;
                transform[10] *= _scaleFactor;

                updateTransformUniform();
                fireRescaled(this);
            }
            return transform[10];
        },

        userBeginRender = function()
        {
            //возвращаем все ноды на место
            nodes.forEach(node => {
                node.drawPosition = {x: node.position.x, y: node.position.y};
                node.labelDirection = {x: 0, y: 0};
                });
            /** @type VivaGeneric.NodeUI */
            let selectedNodeUI = nodes.filter(node => node.selectionMode === SelectionMode.SELECTED_BY_USER).shift();
            if (selectedNodeUI !== undefined) {
                /** @type Ngraph.Graph.Node */
                let selectedNode = selectedNodeUI.node;
                let adjacentNodesUI = selectedNode.links.map(link => allNodes[link.toId !== selectedNode.id ? link.toId : link.fromId]);

                //Все для смежных вершин
                if (adjacentNodesUI.length > 0) {
                    const G = 3;
                    let calcForce = function(node1, node2){
                        let distance = {x: node2.drawPosition.x - node1.drawPosition.x, y: node2.drawPosition.y - node1.drawPosition.y};
                        let dis_len = Math.sqrt(distance.x * distance.x + distance.y * distance.y);
                        let F = G * (node1.size * node2.size) / (dis_len * dis_len);
                        distance.x *= F / dis_len;
                        distance.y *= F / dis_len;
                        return distance;
                    };
                    let initNode = function(node, pos_offset, center_node)
                    {
                        node.position_offset = {x: pos_offset.x, y: pos_offset.y};
                        node.labelDirection.x += node.position.x - center_node.position.x;
                        node.labelDirection.y += node.position.y - center_node.position.y;
                    };
                    for (let i = 0; i < adjacentNodesUI.length; ++i)
                    {
                        initNode(adjacentNodesUI[i], {x: 0, y: 0}, selectedNodeUI);
                    }
                }
            }
        };
    
    graphicsRoot = window.document.createElement("canvas");

    resetScaleInternal();

    var graphics = {
        getLinkUI: function (linkId) {
            return allLinks[linkId];
        },

        getNodeUI: function (nodeId) {
            return allNodes[nodeId];
        },

        /**
         * Sets the callback that creates node representation.
         *
         * @param builderCallback a callback function that accepts graph node
         * as a parameter and must return an element representing this node.
         *
         * @returns If builderCallbackOrNode is a valid callback function, instance of this is returned;
         * Otherwise undefined value is returned
         */
        node : function (builderCallback) {
            if (typeof builderCallback !== "function") {
                return; // todo: throw? This is not compatible with old versions
            }

            nodeUIBuilder = builderCallback;

            return this;
        },

        /**
         * Sets the callback that creates link representation
         *
         * @param builderCallback a callback function that accepts graph link
         * as a parameter and must return an element representing this link.
         *
         * @returns If builderCallback is a valid callback function, instance of this is returned;
         * Otherwise undefined value is returned.
         */
        link : function (builderCallback) {
            if (typeof builderCallback !== "function") {
                return; // todo: throw? This is not compatible with old versions
            }

            linkUIBuilder = builderCallback;
            return this;
        },


        /**
         * Allows to override default position setter for the node with a new
         * function. newPlaceCallback(nodeUI, position) is function which
         * is used by updateNodePosition().
         */
        placeNode : function (newPlaceCallback) {
            userPlaceNodeCallback = newPlaceCallback;
            return this;
        },

        placeLink : function (newPlaceLinkCallback) {
            userPlaceLinkCallback = newPlaceLinkCallback;
            return this;
        },

        /**
         * Custom input manager listens to mouse events to process nodes drag-n-drop inside WebGL canvas
         */
        inputManager : null,

        webglInputEvents: null,

        /**
         * Called every time before renderer starts rendering.
         */
        beginRender : function () {
            // this function could be replaced by this.init,
            // based on user options.
        },

        /**
         * Called every time when renderer finishes one step of rendering.
         */
        endRender : function () {
            if (linksCount > 0) {
                linkProgram.render();
            }
            if (nodesCount > 0) {
                nodeProgram.render();
            }
        },

        bringLinkToFront : function (linkUI) {
            var frontLinkId = linkProgram.getFrontLinkId(),
                srcLinkId,
                temp;

            linkProgram.bringToFront(linkUI);

            if (frontLinkId > linkUI.id) {
                srcLinkId = linkUI.id;

                temp = links[frontLinkId];
                links[frontLinkId] = links[srcLinkId];
                links[frontLinkId].id = frontLinkId;
                links[srcLinkId] = temp;
                links[srcLinkId].id = srcLinkId;
            }
        },

        bringNodeToFront : function (nodeUI) {
            var frontNodeId = nodeProgram.getFrontNodeId(nodeUI.node.data.groupId),
                srcNodeId,
                temp;

            nodeProgram.bringToFront(nodeUI);

            if (frontNodeId > nodeUI.id) {
                srcNodeId = nodeUI.id;

                temp = nodes[frontNodeId];
                nodes[frontNodeId] = nodes[srcNodeId];
                nodes[frontNodeId].id = srcNodeId;
                nodes[srcNodeId] = temp;
                nodes[srcNodeId].id = srcNodeId;
            }
        },

        /**
         * Sets translate operation that should be applied to all nodes and links.
         */
        graphCenterChanged : function (x, y) {
            transform[12] = 2 * x - width;
            transform[13] = height - y * 2;
            updateTransformUniform();
        },

        /**
         * Called by Viva.Graph.View.renderer to let concrete graphic output
         * provider prepare to render given link of the graph
         *
         * @param {Ngraph.Graph.Link} link - model of a link
         * @param {Ngraph.Graph.Position2} boundPosition
         */
        addLink: function (link, boundPosition) {
            var uiid = linksCount++,
                ui = linkUIBuilder(link);
            ui.id = uiid;
            ui.pos = boundPosition;
            ui.link = link;

            linkProgram.createLink(ui);

            links[uiid] = ui;
            allLinks[link.id] = ui;
            return ui;
        },

        /**
         * Called by Viva.Graph.View.renderer to let concrete graphic output
         * provider prepare to render given node of the graph.
         *
         * @param {Ngraph.Graph.Node} node
         * @param {Ngraph.Graph.Position} boundPosition
         */
        addNode : function (node, boundPosition) {
            var uiid = nodesCount++,
                ui = nodeUIBuilder(node);

            ui.id = uiid;
            ui.position = boundPosition;
            ui.node = node;
            
            nodeProgram.createNode(ui);

            nodes[uiid] = ui;
            allNodes[node.id] = ui;
            return ui;
        },

        translateRel : function (dx, dy) {
            transform[12] += dx * 2;
            transform[13] -= dy * 2;
            updateTransformUniform();
        },

        scale : scale,

        getScaleFactor: function(){
          return scaleRate;
        },

        getRotationAngle() {
            return angle;
        },

        resetScale : function () {
            resetScaleInternal();

            if (gl) {
                updateSize();
                updateTransformUniform();
            }
            return this;
        },

       /**
        * Resizes the graphic without resetting the scale. 
        * Useful with viva graph in a dynamic container
        */
        updateSize: updateSize,

       /**
        * Called by Viva.Graph.View.renderer to let concrete graphic output
        * provider prepare to render.
        */
        init : function (c) {
            /** @type {WebGLContextAttributes} */
            var contextParameters = {
                antialias: true,
                preserveDrawingBuffer: options.preserveDrawingBuffer
            };

            container = c;

            resetScaleInternal();
            container.appendChild(graphicsRoot);

           /** @type {WebGLRenderingContext} */
            gl = (graphicsRoot.getContext('experimental-webgl', contextParameters));
            if (!gl) {
                var msg = "Could not initialize WebGL. Seems like the browser doesn't support it.";
                window.alert(msg);
                throw msg;
            }

            if (!gl.getParameter(gl.SAMPLES)) {
                MSAA_SampleCount = 4;
            }
            updateSize();
            if (options.enableBlending) {
                //gl.enable(gl.SAMPLE_COVERAGE);
                //gl.sampleCoverage(1.0, false);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.enable(gl.BLEND);
                gl.enable(gl.CULL_FACE);
            }
            if (options.clearColor) {
                var color = options.clearColorValue;
                gl.clearColor(color.r, color.g, color.b, color.a);
                // TODO: not the best way, really. Should come up with something better
                // what if we need more updates inside beginRender, like depth buffer?
                this.beginRender = function () {
                   // gl.bindFramebuffer(gl.FRAMEBUFFER, MSAA_Framebuffer);
                    //gl.viewport(0, 0, width * MSAA_SampleCount, height * MSAA_SampleCount);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    userBeginRender();
                };
            }

            linkProgram.load(gl);
            linkProgram.updateSize(width / 2, height / 2);

            nodeProgram.load(gl);
            nodeProgram.updateSize(width / 2, height / 2);

            updateTransformUniform();

            // Notify the world if someone waited for update. TODO: should send an event
            if (typeof initCallback === "function") {
                initCallback(graphicsRoot);
            }
        },

        /**
        * Called by Viva.Graph.View.renderer to let concrete graphic output
        * provider release occupied resources.
        */
        release : function (container) {
            if (graphicsRoot && container) {
                container.removeChild(graphicsRoot);
                // TODO: anything else?
            }
        },

       /**
        * Checks whether webgl is supported by this browser.
        */
        isSupported : function () {
            var c = window.document.createElement("canvas"),
                gl = c && c.getContext && c.getContext("experimental-webgl");
            return gl;
        },

       /**
        * Called by Viva.Graph.View.renderer to let concrete graphic output
        * provider remove link from rendering surface.
        *
        * @param {Ngraph.Graph.Link} link
        **/
        releaseLink : function (link) {
            if (linksCount > 0) { linksCount -= 1; }
            var linkUI = allLinks[link.id];
            delete allLinks[link.id];

            linkProgram.removeLink(linkUI);

            var linkIdToRemove = linkUI.id;
            if (linkIdToRemove < linksCount) {
                if (linksCount === 0 || linksCount === linkIdToRemove) {
                    return; // no more links or removed link is the last one.
                }

                var lastLinkUI = links[linksCount];
                links[linkIdToRemove] = lastLinkUI;
                lastLinkUI.id = linkIdToRemove;
            }
        },

       /**
        * Called by Viva.Graph.View.renderer to let concrete graphic output
        * provider remove node from rendering surface.
        *
        * @param {Ngraph.Graph.Node} node 
        **/
        releaseNode : function (node) {
            if (nodesCount > 0) { nodesCount -= 1; }
            var nodeUI = allNodes[node.id];
            delete allNodes[node.id];

            nodeProgram.removeNode(nodeUI);

            var nodeIdToRemove = nodeUI.id;
            if (nodeIdToRemove < nodesCount) {
                if (nodesCount === 0 || nodesCount === nodeIdToRemove) {
                    return; // no more nodes or removed node is the last in the list.
                }

                var lastNodeUI = nodes[nodesCount];

                nodes[nodeIdToRemove] = lastNodeUI;
                lastNodeUI.id = nodeIdToRemove;

                // Since concrete shaders may cache properties in the UI element
                // we are letting them to make this swap (e.g. image node shader
                // uses this approach to update node's offset in the atlas)
                nodeProgram.replaceProperties(nodeUI, lastNodeUI);
            }
        },

        renderNodes: function () {
            var pos = {x:0, y:0};
            // WebGL coordinate system is different. Would be better
            // to have this transform in the shader code, but it would
            // require every shader to be updated..
            for (var i = 0; i < nodesCount; ++i) {
                var ui = nodes[i];
                pos = {x: ui.drawPosition.x, y: ui.drawPosition.y};
                if (userPlaceNodeCallback) {
                    userPlaceNodeCallback(ui, ui.position);
                }
                nodeProgram.position(ui, pos);
            }
        },

        renderLinks: function () {
            if (this.omitLinksRendering) { return; }

            var toPos = {x : 0, y : 0};
            var fromPos = {x : 0, y : 0};
            for (var i = 0; i < linksCount; ++i) {
                var ui = links[i].link;
                var pos = graphics.getNodeUI(ui.fromId).drawPosition;
                fromPos.x = pos.x;
                fromPos.y = -pos.y;
                pos = graphics.getNodeUI(ui.toId).drawPosition;
                toPos.x = pos.x;
                toPos.y = -pos.y;
                if (userPlaceLinkCallback) {
                    userPlaceLinkCallback(links[i], fromPos, toPos);
                }

                linkProgram.position(links[i], fromPos, toPos);
            }
        },

        /**
         * Returns root element which hosts graphics.
         */
        getGraphicsRoot : function (callbackWhenReady) {
            // todo: should fire an event, instead of having this context.
            if (typeof callbackWhenReady === "function") {
                if (graphicsRoot) {
                    callbackWhenReady(graphicsRoot);
                } else {
                    initCallback = callbackWhenReady;
                }
            }
            return graphicsRoot;
        },

        /**
         * Updates default shader which renders nodes
         *
         * @param newProgram to use for nodes.
         */
        setNodeProgram : function (newProgram) {
            if (!gl && newProgram) {
                // Nothing created yet. Just set shader to the new one
                // and let initialization logic take care about the rest.
                nodeProgram = newProgram;
            } else if (newProgram) {
                throw "Not implemented. Cannot swap shader on the fly... Yet.";
                // TODO: unload old shader and reinit.
            }
        },

        /**
         * Updates default shader which renders links
         *
         * @param newProgram to use for links.
         */
        setLinkProgram : function (newProgram) {
            if (!gl && newProgram) {
                // Nothing created yet. Just set shader to the new one
                // and let initialization logic take care about the rest.
                linkProgram = newProgram;
            } else if (newProgram) {
                throw "Not implemented. Cannot swap shader on the fly... Yet.";
                // TODO: unload old shader and reinit.
            }
        },

        /**
         * Transforms client coordinates into layout coordinates. Client coordinates
         * are DOM coordinates relative to the rendering container. Layout
         * coordinates are those assigned by by layout algorithm to each node.
         *
         * @param {Ngraph.Graph.Position} p - a point object with `x` and `y` attributes.
         * This method mutates p.
         */
        transformClientToGraphCoordinates: function (p) {
          // TODO: could be a problem when container has margins?
            // normalize
            p.x = (2 * p.x) - width;
            p.y = height - (2 * p.y);

            // apply transform
            p.x = (p.x - transform[12]) / transform[10];
            p.y = (p.y - transform[13]) / transform[10];
            var angle = getTransformAngle();
            var newP = rotateIt(p.x, p.y, -angle);
            p.x = newP[0];
            p.y = newP[1];

            // transform to graph coordinates
            // p.x = p.x;
            p.y = -p.y;

            return p;
        },

        /**
         * Transforms WebGL coordinates into client coordinates. Reverse of 
         * `transformClientToGraphCoordinates()`
         *
         * @param {Ngraph.Graph.Position} p - a point object with `x` and `y` attributes, which
         * represents a layout coordinate. This method mutates p.
         */
        transformGraphToClientCoordinates: function (p) {
          // TODO: could be a problem when container has margins?
            // transform from graph coordinates
            // p.x = p.x / (width / 2);
            p.y = -p.y;// / (-height / 2);

            // вертим обратно
            var angle = getTransformAngle();
            var newP = rotateIt(p.x, p.y, angle);
            p.x = newP[0];
            p.y = newP[1];

            // apply transform
            p.x = (p.x * transform[10]) + transform[12];
            p.y = (p.y * transform[10]) + transform[13];

            // denormalize
            p.x = (p.x + width) / 2;
            p.y = (height - p.y) / 2;

            return p;
        },

        /**
         * @param {Ngraph.Graph.Position} clientPos
         * @param {function(any,any,any):boolean} preciseCheck
         * @returns {VivaGeneric.NodeUI}
         */
        getNodeAtClientPos: function (clientPos, preciseCheck) {
            if (typeof preciseCheck !== "function") {
                // we don't know anything about your node structure here :(
                // potentially this could be delegated to node program, but for
                // right now, we are giving up if you don't pass boundary check
                // callback. It answers to a question is nodeUI covers  (x, y)
                return null;
            }
            // first transform to graph coordinates:
            this.transformClientToGraphCoordinates(clientPos);
            // now using precise check iterate over each node and find one within box:
            // TODO: This is poor O(N) performance.
            for (var i = 0; i < nodesCount; ++i) {
                if (preciseCheck(nodes[i], clientPos.x, clientPos.y)) {
                    // HACK: нам зачем-то не давали получить визуальное представление узла...
                    // Скорее всего, сломает совместимость с Viva
                    return nodes[i];//.node;
                }
            }
            return null;
        },

        /**
         * @param {number} _angle
         */
        rotate : function(_angle) {
            var cx = Math.cos(_angle);
            var sx = Math.sin(_angle);
            var scale = transform[10];

            // Сначала повернём центр взад
            // var prevAngle = Math.atan2(transform[0] / scale, transform[1] / scale);
            // var normalizedTransform = rotateIt(transform[12], transform[13], -prevAngle);

            // Теперь меняем угол
            transform[0] = transform[5] = cx * scale;
            transform[1] = sx * scale;
            transform[4] = - sx * scale;

            // И вращаем центр вновь
            // var restoredTransform = rotateIt(normalizedTransform[0], normalizedTransform[1], angle);
            // transform[12] = restoredTransform[0];
            // transform[13] = restoredTransform[1];

            updateTransformUniform();
            angle = _angle;
        },

        getTransform : function () {
            return transform;
        },

        pixelRatio : function () {
            return realPixelRatio;
        }
    };

    // Let graphics fire events before we return it to the caller.
    eventify(graphics);

    return graphics;
}
