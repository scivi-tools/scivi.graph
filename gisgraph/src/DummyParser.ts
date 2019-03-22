// @ts-ignore
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { GraphController } from './Core/GraphController';
import { GraphState } from './Core/GraphState';
import { Point } from './Core/Point';
import { Node } from './Core/Node';

export interface DummyNodeEntry {
    name: string;
    value: number;
    location: string;
    latLng: {
        x: number,
        y: number
    }
    words: string[];
}

export async function FromDummyNodeListAsync(list: DummyNodeEntry[]): Promise<GraphController> {
    const provider = new OpenStreetMapProvider();

    const requests = list.map(async entry => {
        const desiredLocation = entry.location.split(';')[0];
        const res = await (provider.search({ query: desiredLocation }) as Promise<any[]>);
        if (!res || !res.length) {
            return null;
        }
        return new Node(entry.name, entry.value, entry.words, new Point(Number(res[0].x), Number(res[0].y)));
    }).filter(value => !!value);
    const nodes = (await Promise.all(requests) as Node[]);

    return Promise.resolve(new GraphController([new GraphState(nodes)]));
}

export function FromDummyNodeList(list: DummyNodeEntry[]): GraphController {
    // TODO: replace x->y (lon->lat) in data
    return new GraphController([new GraphState(list.filter(node => !!node).map(node => new Node(node.name, node.value, node.words, new Point(node.latLng.y, node.latLng.x))))]);
}