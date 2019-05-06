import { Node } from './Core/Node';
import { tryLoadGCSEOnce } from './GApi/Loader';

import '../styles/sidebar.css';

export class Sidebar {
    private _node?: Node;
    private _searchProviderPromise: Promise<google.search.CSEElement>;

    private _overlay: HTMLDivElement;
    private _title: HTMLHeadingElement;
    private _metaList: HTMLUListElement;
    private _locList: HTMLUListElement;

    constructor(container: HTMLElement) {
        this._overlay = (() => {
            const res = document.createElement('div');
            res.textContent = 'Выберите узел';
            res.classList.add('overlay');
            return res;
        })();
        this._title = document.createElement('h1');
        this._title.classList.add('sidebar_header');

        const flexListWrapper = document.createElement('div');
        flexListWrapper.classList.add('list_wrapper');

        const conceptListWrapper = document.createElement('div');
        const conceptHeader = document.createElement('span');
        conceptHeader.textContent = 'Концепты:';
        this._metaList = document.createElement('ul');
        conceptListWrapper.append(conceptHeader, this._metaList);

        const locationListWrapper = document.createElement('div');
        const locationHeader = document.createElement('span');
        locationHeader.textContent = 'Локация:';
        this._locList = document.createElement('ul');
        locationListWrapper.append(locationHeader, this._locList);

        flexListWrapper.append(conceptListWrapper, locationListWrapper);

        const gcseItem = document.createElement('gcse:searchresults-only');
        gcseItem.setAttribute('gname', 'concept-search');
        gcseItem.setAttribute('defaultToImageSearch', 'true');
        this._searchProviderPromise = tryLoadGCSEOnce().then(_ => {
            return google.search.cse.element.getElement('concept-search');
        });
        
        container.append(this._overlay, this._title, flexListWrapper, gcseItem);
    }

    set node(value: Node) {
        if (!!this._node) {
            this.reset();
        }
        this._node = value;

        this._title.innerText = value.name;
        
        this._metaList.append(...value.metadata[Node.CONCEPTS_META_NAME].map(m => {
            const res = document.createElement('li');
            res.textContent = m;
            return res;
        }));
        this._locList.append(...value.metadata[Node.LOCATION_META_NAME].map(m => {
            const res = document.createElement('li');
            res.textContent = m;
            return res;
        }));

        this._searchProviderPromise.then(cse => cse.execute(value.metadata[Node.CONCEPTS_META_NAME].join(' ')));
        this._overlay.style.visibility = 'hidden';
    }

    reset() {
        this._node = undefined;
        this._title.textContent = '';

        this._metaList = destructiveClear(this._metaList);
        this._locList = destructiveClear(this._locList);

        this._searchProviderPromise.then(cse => cse.clearAllResults());
        this._overlay.style.visibility = 'visible';
    }
}
/**
 * HACK: ultra-fast cleaning of item
 * https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript/22966637#22966637
 * @param el Item to clear
 */
function destructiveClear<T extends HTMLElement>(el : T): T {
    if (!el.parentNode) {
        el.innerHTML = '';
        return el;
    }
    const clone = el.cloneNode(false) as T;
    el.parentNode!.replaceChild(clone, el);
    return clone;
}