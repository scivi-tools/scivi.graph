
/// <reference path="./@types/ngraph.generic.d.ts" />
/// <reference path="./@types/viva.generic.d.ts" />

export * from './GraphController'
export * from './VivaWebGLRenderer'
export * from './VivaStateView'
export { getOrCreateTranslatorInstance } from '@scivi/utils'

export function getParameterByName(name: string, url: string): string
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
