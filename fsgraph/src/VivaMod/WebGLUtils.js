/**
 * @fileOverview Utility functions for webgl rendering.
 *
 * @author Andrei Kashcha (aka anvaka) / http://anvaka.blogspot.com
 */
 //@ts-check

/**
 * @param {WebGLRenderingContext} gl
 * @param {string} shaderText
 * @param {number} type
 */
export function CreateShader(gl, shaderText, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, shaderText);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        let msg = gl.getShaderInfoLog(shader);
        window.alert(msg);
        throw msg;
    }

    return shader;
}

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {string} vertexShaderSrc 
 * @param {string} fragmentShaderSrc 
 */
export function CreateProgram(gl, vertexShaderSrc, fragmentShaderSrc) {
    let program = gl.createProgram();
    let vs = CreateShader(gl, vertexShaderSrc, gl.VERTEX_SHADER);
    let fs = CreateShader(gl, fragmentShaderSrc, gl.FRAGMENT_SHADER);

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        let msg = gl.getShaderInfoLog(program);
        window.alert(msg);
        throw msg;
    }

    return program;
}

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {WebGLProgram} program 
 * @param {string[]} uniformOrAttributeNames 
 */
export function GetLocations(gl, program, uniformOrAttributeNames) {
    let foundLocations = {};
    for (let i = 0; i < uniformOrAttributeNames.length; ++i) {
        let name = uniformOrAttributeNames[i];
        let location = -1;
        if (name[0] === 'a' && name[1] === '_') {
            location = gl.getAttribLocation(program, name);
            if (location === -1) {
                throw new Error("Program doesn't have required attribute: " + name);
            }

            foundLocations[name.slice(2)] = location;
        } else if (name[0] === 'u' && name[1] === '_') {
            let ulocation = gl.getUniformLocation(program, name);
            if (ulocation === null) {
                throw new Error("Program doesn't have required uniform: " + name);
            }

            foundLocations[name.slice(2)] = ulocation;
        } else {
            throw new Error("Couldn't figure out your intent. All uniforms should start with 'u_' prefix, and attributes with 'a_'");
        }
    }

    return foundLocations;
}

/**
 * 
 * @param {any[]} buffer 
 * @param {number} itemsInBuffer 
 * @param {number} elementsPerItem 
 */
export function ExtendArray(buffer, itemsInBuffer, elementsPerItem) {
    if ((itemsInBuffer + 1) * elementsPerItem > buffer.length) {
        // Every time we run out of space create new array twice bigger.
        // TODO: it seems buffer size is limited. Consider using multiple arrays for huge graphs
        var extendedArray = new Float32Array(buffer.length * elementsPerItem * 2);
        extendedArray.set(buffer);

        return extendedArray;
    }

    return buffer;
}

/**
 * 
 * @param {any[] | Float32Array | Uint32Array} array 
 * @param {number} to 
 * @param {number} from 
 * @param {number} elementsCount 
 */
export function CopyArrayPart(array, to, from, elementsCount) {
    for (let i = 0; i < elementsCount; ++i) {
        array[to + i] = array[from + i];
    }
}

/**
 * 
 * @param {any[] | Float32Array | Uint32Array} array 
 * @param {number} from 
 * @param {number} to 
 * @param {number} elementsCount 
 */
export function SwapArrayPart(array, from, to, elementsCount) {
    for (let i = 0; i < elementsCount; ++i) {
        var tmp = array[from + i];
        array[from + i] = array[to + i];
        array[to + i] = tmp;
    }
}
