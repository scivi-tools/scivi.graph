/**
 * @author Andrei Kashcha (aka anvaka)
 * @author Me
 */

import * as WGLU from './WebGLUtils';
import { VivaBaseUI } from '../VivaBaseUI';
import { VivaImageNodeUI } from '../VivaImageNodeUI';
import { VivaColoredNodeRenderer, ATTRIBUTES_PER_PRIMITIVE, _BYTES_PER_ELEMENT } from './VivaColoredNodeRenderer';

/**
 * Defines simple UI for nodes in webgl renderer. Each node is rendered as an image.
 */
export class VivaRombusNodeRenderer extends VivaColoredNodeRenderer {
    constructor(defBufferLength = 64) {
        super(defBufferLength);

        this._nodesFS = createNodeFragmentShader();

        // TODO: workaround assert if interface is implemented
        // https://github.com/Microsoft/TypeScript/issues/17498#issuecomment-399439654   
        /** @type {VivaGeneric.NodeProgram} */
        const assertion = this;
    }

    /**
     * 
     * @param {VivaImageNodeUI} nodeUI 
     * @param {Ngraph.Graph.Position} pos 
     */
    position(nodeUI, pos) {
        const idx = nodeUI.id * ATTRIBUTES_PER_PRIMITIVE;
        this._nodes[idx + 2] = pos.x;
        this._nodes[idx + 3] = -(pos.y - nodeUI.size);
        this._colors[idx + 4] = nodeUI.color;
    
        this._nodes[idx + 5 + 2] = pos.x + nodeUI.size;
        this._nodes[idx + 5 + 3] = -(pos.y);
        this._colors[idx + 5 + 4] = nodeUI.color;
    
        this._nodes[idx + 10 + 2] = pos.x - nodeUI.size;
        this._nodes[idx + 10 + 3] = -(pos.y);
        this._colors[idx + 10 + 4] = nodeUI.color;
    
        this._nodes[idx + 15 + 2] = pos.x - nodeUI.size;
        this._nodes[idx + 15 + 3] = -(pos.y);
        this._colors[idx + 15 + 4] = nodeUI.color;
    
        this._nodes[idx + 20 + 2] = pos.x + nodeUI.size;
        this._nodes[idx + 20 + 3] = -(pos.y);
        this._colors[idx + 20 + 4] = nodeUI.color;
    
        this._nodes[idx + 25 + 2] = pos.x;
        this._nodes[idx + 25 + 3] = -(pos.y + nodeUI.size);
        this._colors[idx + 25 + 4] = nodeUI.color;
    }

    /**
     * 
     * @param {VivaImageNodeUI} ui 
     */
    createNode(ui) {
        if ((this._nodesCount + 1) * _BYTES_PER_ELEMENT * 6 >= this._byteStorage.byteLength) {
            let extendedStorage = new ArrayBuffer(this._byteStorage.byteLength * 2);
            let extNodes = new Float32Array(extendedStorage);
            let extColors = new Uint32Array(extendedStorage);

            // extColors.set(this._colors);
            extNodes.set(this._nodes);

            this._colors = extColors;
            this._nodes = extNodes;
            this._byteStorage = extendedStorage;
        }

        const idx = this._nodesCount * ATTRIBUTES_PER_PRIMITIVE

        this._nodes[idx] = 0.5;
        this._nodes[idx + 1] = 0;

        this._nodes[idx + 5] = 1;
        this._nodes[idx + 5 + 1] = 0.5;

        this._nodes[idx + 10] = 0;
        this._nodes[idx + 10 + 1] = 0.5;

        this._nodes[idx + 15] = 0;
        this._nodes[idx + 15 + 1] = 0.5;

        this._nodes[idx + 20] = 1;
        this._nodes[idx + 20 + 1] = 0.5;

        this._nodes[idx + 25] = 0.5;
        this._nodes[idx + 25 + 1] = 1;

        this._nodesCount += 1;
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
            float d = abs(v_uv.x) + abs(v_uv.y);
            float inR = step(minBorderR, d);
            float outR = step(maxBorderR, d);
            gl_FragColor = mix(v_color, mix(vec4(0, 0, 0, v_color.a * maxBorderOpacity), vec4(0), outR), inR);
        }`;
}
