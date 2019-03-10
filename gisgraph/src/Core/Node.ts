import { Point } from "./Point";

export class Node {
    constructor(
        public name: string,
        public readonly weight: number,
        private readonly metadata: any[],
        private readonly location: Point
    ) { }
}
