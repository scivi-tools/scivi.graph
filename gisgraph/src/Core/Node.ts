import { Point } from "./Point";

export class Node {
    constructor(
        public name: string,
        public readonly weight: number,
        public readonly metadata: any[],
        public readonly location: Point
    ) { }
}
