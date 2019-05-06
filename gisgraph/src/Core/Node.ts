import { Point } from "./Point";

export class Node {
    static LOCATION_META_NAME = 'location';
    static CONCEPTS_META_NAME = 'words';

    constructor(
        public name: string,
        public readonly weight: number,
        public readonly metadata: { [x: string]: any[] },
        public readonly location: Point
    ) { }
}
