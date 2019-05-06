/// <reference path="../@types/gapi-search.d.ts" />

/** GCSE v2 key */
const cx = '002317623494447253371:ac8ru3gfhxe';

let gcsePromise: Promise<never>;

export function tryLoadGCSEOnce(): Promise<never> {
    if (!!gcsePromise) {
        return gcsePromise;
    }

    return gcsePromise = new Promise<never>((resolve, reject) => {
        // @ts-ignore
        window['__gcse'] = {
            /** 'explicit' | 'onload' (default) */
            parseTags: 'onload',
            callback: resolve
        };

        const gcse = document.createElement('script');
        gcse.type = 'text/javascript';
        gcse.async = true;
        gcse.src = `https://cse.google.com/cse.js?cx=${cx}`;
        gcse.addEventListener('error', (ev) => {
            reject(ev);
        });
        gcse.addEventListener('abort', (ev) => {
            reject(ev);
        });
        document.head.append(gcse);
    });
}
