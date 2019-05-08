// @ts-ignore
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { GraphController } from './Core/GraphController';
import { GraphState } from './Core/GraphState';
import { Point } from './Core/Point';
import { Node } from './Core/Node';
import { Metrics } from './Core/Metrics';

export interface DummyNodeEntry {
    name: string;
    value: number;
    location: string;
    latLng: {
        x: number,
        y: number
    };
    words: string[];
    datetime: number;
}

export async function FromDummyNodeListAsync(list: DummyNodeEntry[]): Promise<GraphController> {
    const provider = new OpenStreetMapProvider();

    const requests = list.map(async entry => {
        const locations = entry.location.split(';');
        const desiredLocation = locations[0];
        const res = await (provider.search({ query: desiredLocation }) as Promise<any[]>);
        if (!res || !res.length) {
            return null;
        }
        return new Node(entry.name, entry.value, {
            'words': entry.words,
            'locations': locations
        }, new Point(Number(res[0].x), Number(res[0].y)), entry.datetime);
    }).filter(value => !!value);
    const nodes = (await Promise.all(requests) as Node[]);

    return Promise.resolve(new GraphController([new GraphState(nodes)]));
}

export function FromDummyNodeList(list: DummyNodeEntry[]): GraphController {
    // TODO: replace x->y (lon->lat) in data
    const monitoredFields = ['weight', 'datetime'];
    return new GraphController([
        new GraphState(
            list.filter(node => !!node)
                .map(node => new Node(node.name, node.value, {
                    [Node.CONCEPTS_META_NAME]: node.words,
                    [Node.LOCATION_META_NAME]: node.location.split(';')
                }, new Point(node.latLng.y, node.latLng.x), node.datetime)),
            new Metrics(monitoredFields)
        )
    ]);
}