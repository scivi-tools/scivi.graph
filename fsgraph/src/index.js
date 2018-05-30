//@ts-check
/// <reference path="./@types/ngraph.d.ts" />

export * from './GraphController.js'
export * from './VivaWebGLRenderer.js'
export * from './VivaStateView'

/**
 * 
 * @param {string} name 
 * @param {string} url 
 */
export function getParameterByName(name, url)
{
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    var results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
