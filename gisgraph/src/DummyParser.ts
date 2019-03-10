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