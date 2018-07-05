/**
 * @author Me
 */
//@ts-check
import { Point2D } from '../Point2D';
import * as WGLU from './WebGLUtils';
import { VivaBaseUI } from '../VivaBaseUI';
import { VivaLinkUI } from '../VivaLinkUI';
/// <reference path="../@types/ngraph.d.ts" />

/**
 * u, v, x, y, color - 4 byte each, 6 vertex
 */
const ATTRIBUTES_PER_PRIMITIVE = 30;
const _BYTES_PER_ELEMENT = 4 * Float32Array.BYTES_PER_ELEMENT + Uint32Array.BYTES_PER_ELEMENT;

export class VivaWideLinkRenderer {
    constructor(defBufferLength = 64) {
        this._byteStorage = new ArrayBuffer(defBufferLength * 6 * _BYTES_PER_ELEMENT);
        this._links = new Float32Array(this._byteStorage);
        this._colors = new Uint32Array(this._byteStorage);
        this._nodesFS = createNodeFragmentShader();
        this._nodesVS = createNodeVertexShader();
        this._program = null;
        this._gl = null;
        this._buffer = null;
        this._locations = null;
        this._linksCount = 0;
        this._width = null;
        this._height = null;
        this._transform = null;
        this._sizeDirty = false;
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
     * @param {VivaLinkUI} linkUI 
     * @param {NgraphGraph.Position} fromPos 
     * @param {NgraphGraph.Position} toPos 
     */
    position(linkUI, fromPos, toPos) {
        const idx = linkUI.id * ATTRIBUTES_PER_PRIMITIVE;
        const angle = Point2D.Subtract(fromPos, toPos).angle;
        const rotCos = -Math.sin(angle);
        const rotSin = Math.cos(angle);

        this._links[idx + 2] = fromPos.x + linkUI.size * rotCos;
        this._links[idx + 3] = +(fromPos.y + linkUI.size * rotSin);
        this._colors[idx + 4] = linkUI.color;
    
        this._links[idx + 5 + 2] = toPos.x + linkUI.size * rotCos;
        this._links[idx + 5 + 3] = +(toPos.y + linkUI.size * rotSin);
        this._colors[idx + 5 + 4] = linkUI.color;
    
        this._links[idx + 10 + 2] = fromPos.x - linkUI.size * rotCos;
        this._links[idx + 10 + 3] = +(fromPos.y - linkUI.size * rotSin);
        this._colors[idx + 10 + 4] = linkUI.color;
    
        this._links[idx + 15 + 2] = toPos.x + linkUI.size * rotCos;
        this._links[idx + 15 + 3] = +(toPos.y + linkUI.size * rotSin);
        this._colors[idx + 15 + 4] = linkUI.color;
    
        this._links[idx + 20 + 2] = toPos.x - linkUI.size * rotCos;
        this._links[idx + 20 + 3] = +(toPos.y - linkUI.size * rotSin);
        this._colors[idx + 20 + 4] = linkUI.color;
    
        this._links[idx + 25 + 2] = fromPos.x - linkUI.size * rotCos;
        this._links[idx + 25 + 3] = +(fromPos.y - linkUI.size * rotSin);
        this._colors[idx + 25 + 4] = linkUI.color;
    }

    /**
     * 
     * @param {VivaLinkUI} ui 
     */
    createLink(ui) {
        if ((this._linksCount + 1) * _BYTES_PER_ELEMENT * 6 >= this._byteStorage.byteLength) {
            let extendedStorage = new ArrayBuffer(this._byteStorage.byteLength * 2);
            let extNodes = new Float32Array(extendedStorage);
            let extColors = new Uint32Array(extendedStorage);

            extNodes.set(this._links);

            this._colors = extColors;
            this._links = extNodes;
            this._byteStorage = extendedStorage;
        }

        const idx = this._linksCount * ATTRIBUTES_PER_PRIMITIVE

        this._links[idx] = 0;
        this._links[idx + 1] = 0;

        this._links[idx + 5] = 1;
        this._links[idx + 5 + 1] = 0;

        this._links[idx + 10] = 0;
        this._links[idx + 10 + 1] = 1;

        this._links[idx + 15] = 1;
        this._links[idx + 15 + 1] = 0;

        this._links[idx + 20] = 1;
        this._links[idx + 20 + 1] = 1;

        this._links[idx + 25] = 0;
        this._links[idx + 25 + 1] = 1;

        this._linksCount += 1;
    }
  
    /**
     * 
     * @param {VivaLinkUI} linkUI 
     */
    removeLink(linkUI) {
        if (this._linksCount > 0) {
            this._linksCount -= 1;
        }

        if (linkUI.id < this._linksCount && this._linksCount > 0) {

            WGLU.CopyArrayPart(this._colors,
                linkUI.id * ATTRIBUTES_PER_PRIMITIVE,
                this._linksCount * ATTRIBUTES_PER_PRIMITIVE,
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
    
        this._gl.drawArrays(this._gl.TRIANGLES, 0, this._linksCount * 6);
    }

    bringToFront(link) {
        // unused
    }

    getFrontLinkId() {
        return -1;
    }
    
    // #endregion
}

// TODO: Use glslify for shaders
function createNodeFragmentShader() {
    return `
        precision mediump float;
        varying vec2 v_uv;
        varying vec4 v_color;
        const float minBorderR = 0.92;
        const float maxBorderR = 0.98;
        const float maxBorderOpacity = 0.8;

        void main(void) {
            float d = sqrt(v_uv.y * v_uv.y);
            float inR = step(minBorderR, d);
            float outR = step(maxBorderR, d);
            gl_FragColor = mix(v_color, mix(vec4(0, 0, 0, v_color.a * maxBorderOpacity), vec4(0), outR), inR);
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
            v_uv = 2.0 * a_uv - 1.0;
            gl_Position = u_transform * vec4(a_vertexPos, 0, 1);
            gl_Position.xy /= u_screenSize;
        }`;
}
