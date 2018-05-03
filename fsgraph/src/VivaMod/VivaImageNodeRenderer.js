/**
 * @fileOverview Defines an image nodes for webglGraphics class.
 * Shape of nodes is square.
 *
 * @author Andrei Kashcha (aka anvaka)
 * @author Me
 */
//@ts-check
import Viva from '../viva-proxy'
import { VivaBaseUI } from '../VivaBaseUI'
import { VivaImageNodeUI } from '../VivaImageNodeUI'

const ATTRIBUTES_PER_PRIMITIVE = 18;

/**
 * Defines simple UI for nodes in webgl renderer. Each node is rendered as an image.
 */
export class VivaImageNodeRenderer {
    constructor(defBufferLength = 64) {
        this._nodes = new Float32Array(defBufferLength);
        this._nodesFS = createNodeFragmentShader();
        this._nodesVS = createNodeVertexShader();
        this._tilesPerTexture = 1024; // TODO: Get based on max texture size
        this._atlas = null;
        this._program = null;
        this._gl = null;
        this._buffer = null;
        this._utils = null;
        this._locations = null;
        this._nodesCount = 0;
        this._width = null;
        this._height = null;
        this._transform = null;
        this._sizeDirty = false;
    }

    // #region VivaAPI

    load(glContext) {
        this._gl = glContext;
        this._utils = Viva.Graph.webgl(glContext);
    
        // HACK: why this used to be 'new WebglAtlas()'?
        this._atlas = Viva.Graph.View.webglAtlas(this._tilesPerTexture);
    
        this._program = this._utils.createProgram(this._nodesVS, this._nodesFS);
        this._gl.useProgram(this._program);
        this._locations = this._utils.getLocations(this._program, ["a_vertexPos", "a_customAttributes", "u_screenSize", "u_transform", "u_sampler0", "u_sampler1", "u_sampler2", "u_sampler3", "u_tilesPerTexture"]);
    
        this._gl.uniform1f(this._locations.tilesPerTexture, this._tilesPerTexture);
    
        this._gl.enableVertexAttribArray(this._locations.vertexPos);
        this._gl.enableVertexAttribArray(this._locations.customAttributes);
    
        this._buffer = this._gl.createBuffer();
    }

    /**
     * 
     * @param {VivaImageNodeUI} nodeUI 
     * @param {*} pos 
     */
    position(nodeUI, pos) {
        const idx = nodeUI.id * ATTRIBUTES_PER_PRIMITIVE;
        this._nodes[idx] = pos.x - nodeUI.size;
        this._nodes[idx + 1] = -(pos.y - nodeUI.size);
        this._nodes[idx + 2] = nodeUI.offset * 4;
    
        this._nodes[idx + 3] = pos.x + nodeUI.size;
        this._nodes[idx + 4] = -(pos.y - nodeUI.size);
        this._nodes[idx + 5] = nodeUI.offset * 4 + 1;
    
        this._nodes[idx + 6] = pos.x - nodeUI.size;
        this._nodes[idx + 7] = -(pos.y + nodeUI.size);
        this._nodes[idx + 8] = nodeUI.offset * 4 + 2;
    
        this._nodes[idx + 9] = pos.x - nodeUI.size;
        this._nodes[idx + 10] = -(pos.y + nodeUI.size);
        this._nodes[idx + 11] = nodeUI.offset * 4 + 2;
    
        this._nodes[idx + 12] = pos.x + nodeUI.size;
        this._nodes[idx + 13] = -(pos.y - nodeUI.size);
        this._nodes[idx + 14] = nodeUI.offset * 4 + 1;
    
        this._nodes[idx + 15] = pos.x + nodeUI.size;
        this._nodes[idx + 16] = -(pos.y + nodeUI.size);
        this._nodes[idx + 17] = nodeUI.offset * 4 + 3;
    }

    /**
     * 
     * @param {VivaImageNodeUI} ui 
     */
    createNode(ui) {
        this._nodes = this._utils.extendArray(this._nodes, this._nodesCount, ATTRIBUTES_PER_PRIMITIVE);
        this._nodesCount += 1;
    
        let coordinates = this._atlas.getCoordinates(ui.src);
        if (coordinates) {
            ui.offset = coordinates.offset;
        } else {
            ui.offset = 0;
            // Image is not yet loaded into the atlas. Reload it:
            this._atlas.load(ui.src, (coordinates) => {
                ui.offset = coordinates.offset;
            });
        }
    }
  
    removeNode(nodeUI) {
        if (this._nodesCount > 0) {
            this._nodesCount -= 1;
        }

        if (nodeUI.id < this._nodesCount && this._nodesCount > 0) {
            if (nodeUI.src) {
                this._atlas.remove(nodeUI.src);
            }

            this._utils.copyArrayPart(this._nodes, nodeUI.id * ATTRIBUTES_PER_PRIMITIVE, this._nodesCount * ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
        }
    }
  
    replaceProperties(replacedNode, newNode) {
        newNode.offset = replacedNode.offset;
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
        this._gl.bufferData(this._gl.ARRAY_BUFFER, this._nodes, this._gl.DYNAMIC_DRAW);
    
        if (this._sizeDirty) {
            this._sizeDirty = false;
            this._gl.uniformMatrix4fv(this._locations.transform, false, this._transform);
            this._gl.uniform2f(this._locations.screenSize, this._width, this._height);
        }
    
        this._gl.vertexAttribPointer(this._locations.vertexPos, 2, this._gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
        this._gl.vertexAttribPointer(this._locations.customAttributes, 1, this._gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 2 * 4);
    
        this._ensureAtlasTextureUpdated();
    
        this._gl.drawArrays(this._gl.TRIANGLES, 0, this._nodesCount * 6);
    }
    
    // #endregion

    _refreshTexture(texture, idx) {
        if (texture.nativeObject) {
            this._gl.deleteTexture(texture.nativeObject);
        }
    
        const nativeObject = this._gl.createTexture();
        this._gl.activeTexture(this._gl["TEXTURE" + idx]);
        this._gl.bindTexture(this._gl.TEXTURE_2D, nativeObject);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, texture.canvas);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR_MIPMAP_NEAREST);
    
        this._gl.generateMipmap(this._gl.TEXTURE_2D);
        this._gl.uniform1i(this._locations["sampler" + idx], idx);
    
        texture.nativeObject = nativeObject;
    }
  
    _ensureAtlasTextureUpdated() {
        if (this._atlas.isDirty) {
            let textures = this._atlas.getTextures(),
                i;
            for (i = 0; i < textures.length; ++i) {
                if (textures[i].isDirty || !textures[i].nativeObject) {
                    this._refreshTexture(textures[i], i);
                }
            }
      
            this._atlas.clearDirty();
        }
    }
}

// TODO: Use glslify for shaders
function createNodeFragmentShader() {
    return `
        precision mediump float;
        varying vec4 color;
        varying vec3 vTextureCoord;
        uniform sampler2D u_sampler0;
        uniform sampler2D u_sampler1;
        uniform sampler2D u_sampler2;
        uniform sampler2D u_sampler3;

        void main(void) {
            if (vTextureCoord.z == 0.) {
                gl_FragColor = texture2D(u_sampler0, vTextureCoord.xy);
            } else if (vTextureCoord.z == 1.) {
                gl_FragColor = texture2D(u_sampler1, vTextureCoord.xy);
            } else if (vTextureCoord.z == 2.) {
                gl_FragColor = texture2D(u_sampler2, vTextureCoord.xy);
            } else if (vTextureCoord.z == 3.) {
                gl_FragColor = texture2D(u_sampler3, vTextureCoord.xy);
            } else { gl_FragColor = vec4(0, 1, 0, 1); }
        }`;
}

function createNodeVertexShader() {
    return `
        attribute vec2 a_vertexPos;

        attribute float a_customAttributes;
        uniform vec2 u_screenSize;
        uniform mat4 u_transform;
        uniform float u_tilesPerTexture;
        varying vec3 vTextureCoord;

        void main(void)
        {
            gl_Position = u_transform * vec4(a_vertexPos, 0, 1);
            gl_Position.xy /= u_screenSize;
            float corner = mod(a_customAttributes, 4.);
            float tileIndex = mod(floor(a_customAttributes / 4.), u_tilesPerTexture);
            float tilesPerRow = sqrt(u_tilesPerTexture);
            float tileSize = 1./tilesPerRow;
            float tileColumn = mod(tileIndex, tilesPerRow);
            float tileRow = floor(tileIndex/tilesPerRow);

            if(corner == 0.0) {
              vTextureCoord.xy = vec2(0, 1);
            } else if(corner == 1.0) {
              vTextureCoord.xy = vec2(1, 1);
            } else if(corner == 2.0) {
              vTextureCoord.xy = vec2(0, 0);
            } else {
              vTextureCoord.xy = vec2(1, 0);
            }

            vTextureCoord *= tileSize;
            vTextureCoord.x += tileColumn * tileSize;
            vTextureCoord.y += tileRow * tileSize;
            vTextureCoord.z = floor(floor(a_customAttributes / 4.)/u_tilesPerTexture);
        }`;
}
