/**
 * @author Andrei Kashcha (aka anvaka)
 * @author Me
 */

import * as WGLU from './WebGLUtils';
import { VivaBaseUI } from '../VivaBaseUI';
import { VivaImageNodeUI } from '../VivaImageNodeUI';

/**
 * u, v, x, y, color - 4 byte each, 6 vertex
 */
export const ATTRIBUTES_PER_PRIMITIVE = 15;
export const _BYTES_PER_ELEMENT = 4 * Float32Array.BYTES_PER_ELEMENT + Uint32Array.BYTES_PER_ELEMENT;

/**
 * Defines simple UI for nodes in webgl renderer. Each node is rendered as an image.
 */
export class VivaTriangleNodeRenderer {
    constructor(defBufferLength = 64) {
        this._byteStorage = new ArrayBuffer(defBufferLength * 3 * _BYTES_PER_ELEMENT);
        this._nodes = new Float32Array(this._byteStorage);
        this._colors = new Uint32Array(this._byteStorage);
        this._nodesFS = createNodeFragmentShader();
        this._nodesVS = createNodeVertexShader();
        this._program = null;
        /** @type {WebGLRenderingContext} */
        this._gl = null;
        this._buffer = null;
        this._locations = null;
        this._nodesCount = 0;
        this._width = null;
        this._height = null;
        this._transform = null;
        this._sizeDirty = false;
        this._frontNodeId = 0;

        // TODO: workaround assert if interface is implemented
        // https://github.com/Microsoft/TypeScript/issues/17498#issuecomment-399439654   
        /** @type {VivaGeneric.NodeProgram} */
        const assertion = this;
    }

    // #region VivaAPI

    load(glContext) {
        this._gl = glContext;
    
        this._program = WGLU.CreateProgram(this._gl, this._nodesVS, this._nodesFS);
        this._gl.useProgram(this._program);
        this._locations = WGLU.GetLocations(this._gl, this._program, [
            "a_uv",
            "a_vertexPos",
            "a_color",
            "u_screenSize",
            "u_transform"
        ]);
    
        this._gl.enableVertexAttribArray(this._locations.uv);
        this._gl.enableVertexAttribArray(this._locations.vertexPos);
        this._gl.enableVertexAttribArray(this._locations.color);
    
        this._buffer = this._gl.createBuffer();
    }

    /**
     * 
     * @param {VivaImageNodeUI} nodeUI 
     * @param {Ngraph.Graph.Position} pos 
     */
    position(nodeUI, pos) {
        const idx = nodeUI.id * ATTRIBUTES_PER_PRIMITIVE;
        const node_size = nodeUI.size;
        pos.y = -pos.y;
        this._nodes[idx + 2] = pos.x - node_size;
        this._nodes[idx + 3] = pos.y - node_size;
        this._colors[idx + 4] = nodeUI.color;
    
        this._nodes[idx + 5 + 2] = pos.x + node_size;
        this._nodes[idx + 5 + 3] = pos.y - node_size;
        this._colors[idx + 5 + 4] = nodeUI.color;
    
        this._nodes[idx + 10 + 2] = pos.x;
        this._nodes[idx + 10 + 3] = pos.y + node_size;
        this._colors[idx + 10 + 4] = nodeUI.color;
    }

    /**
     * 
     * @param {VivaImageNodeUI} ui 
     */
    createNode(ui) {
        if ((this._nodesCount + 1) * _BYTES_PER_ELEMENT * 3 >= this._byteStorage.byteLength) {
            let extendedStorage = new ArrayBuffer(this._byteStorage.byteLength * 2);
            let extNodes = new Float32Array(extendedStorage);
            let extColors = new Uint32Array(extendedStorage);

            // extColors.set(this._colors);
            extNodes.set(this._nodes);

            this._colors = extColors;
            this._nodes = extNodes;
            this._byteStorage = extendedStorage;
            this._frontNodeId = ui.id;
        }

        const idx = this._nodesCount * ATTRIBUTES_PER_PRIMITIVE

        this._nodes[idx] = 0;
        this._nodes[idx + 1] = 0;

        this._nodes[idx + 5] = 1;
        this._nodes[idx + 5 + 1] = 0;

        this._nodes[idx + 10] = 0.5;
        this._nodes[idx + 10 + 1] = 1;

        this._nodesCount += 1;
    }
  
    removeNode(nodeUI) {
        if (this._nodesCount > 0) {
            this._nodesCount -= 1;
        }

        if (nodeUI.id < this._nodesCount && this._nodesCount > 0) {

            WGLU.CopyArrayPart(this._colors,
                nodeUI.id * ATTRIBUTES_PER_PRIMITIVE,
                this._nodesCount * ATTRIBUTES_PER_PRIMITIVE,
                ATTRIBUTES_PER_PRIMITIVE
            );
        }
    }
  
    updateTransform(newTransform) {
        this._sizeDirty = true;
        this._transform = newTransform;
    }
  
    updateSize(w, h) {
        this._width = w * 2;
        this._height = h * 2;
        this._sizeDirty = true;
    }
  
    render() {
        this._gl.useProgram(this._program);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._buffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, this._byteStorage, this._gl.DYNAMIC_DRAW);
    
        if (this._sizeDirty) {
            this._sizeDirty = false;
            this._gl.uniformMatrix4fv(this._locations.transform, false, this._transform);
            this._gl.uniform2f(this._locations.screenSize, this._width, this._height);
        }
    
        this._gl.vertexAttribPointer(this._locations.uv, 2, this._gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
        this._gl.vertexAttribPointer(this._locations.vertexPos, 2, this._gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * 4);
        this._gl.vertexAttribPointer(this._locations.color, 4, this._gl.UNSIGNED_BYTE, true, 5 * Float32Array.BYTES_PER_ELEMENT, 4 * 4);
    
        this._gl.drawArrays(this._gl.TRIANGLES, 0, this._nodesCount * 3);
        this._frontNodeId = this._nodesCount - 1;
    }

    replaceProperties(replacedNode, newNode) {
        //unused
    }

    bringToFront(node) {
        if (this._frontNodeId > node.id) {
            WGLU.SwapArrayPart(this._nodes, node.id * ATTRIBUTES_PER_PRIMITIVE, this._frontNodeId * ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
        }
        if (this._frontNodeId > 0) {
            this._frontNodeId -= 1;
        }
    }

    getFrontNodeId(groupId) {
        return this._frontNodeId;
    }

    // #endregion
}

// TODO: Use glslify for shaders
function createNodeFragmentShader() {
    return `
        precision mediump float;
        varying vec2 v_uv;
        varying vec4 v_color;
        const float minBorderR = 0.7;
        const float maxBorderR = 0.8;
        const float maxR = 1.0;
        const float maxBorderOpacity = 0.9;
        const float sqrt_2 = 1.414213562373095;

        void main(void) {
            //расстояния от точки до всех сторон треугольника
            float d = abs(v_uv.x) + 0.5 * abs(v_uv.y);
            
            float inR = smoothstep(minBorderR, maxBorderR, d);
            float outR = step(maxBorderR, d);
            float opacity = smoothstep(maxR, maxBorderR, d);
            vec4 outBorderColor = vec4(vec3(0), opacity * maxBorderOpacity);
            vec4 border = mix(vec4(vec3(0), maxBorderOpacity), outBorderColor, maxR);
            gl_FragColor = mix(v_color, border, inR);
        }`;
}

function createNodeVertexShader() {
    return `
        attribute vec2 a_uv;
        attribute vec2 a_vertexPos;
        attribute vec4 a_color;
        uniform vec2 u_screenSize;
        uniform mat4 u_transform;
        varying vec2 v_uv;
        varying vec4 v_color;

        void main(void)
        {
            v_color = a_color.abgr;
            v_uv = vec2(a_uv.x - 0.5, a_uv.y);  
            gl_Position = u_transform * vec4(a_vertexPos, 0, 1);
            gl_Position.xy /= u_screenSize;
        }`;
}
