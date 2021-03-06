export * from './Translator';

export function getParameterByName(name: string, url: string): string | undefined
{
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    var results = regex.exec(url);
    if (!results)
        return undefined;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
