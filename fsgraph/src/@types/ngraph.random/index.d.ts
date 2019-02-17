declare module 'ngraph.random' {

    export interface RandomGenerator {
        next(maxValue: number): number
    }

    export interface RandomIterator<T> {
        forEach(callback: (item: T) => void): void;
        shuffle(): T[];
    }

    export interface RandomGeneratorEx extends RandomGenerator {
        nextDouble(): number;
    }

    export function random(seed?: number): RandomGeneratorEx;
    export function randomIterator<T>(values: T[], random?: RandomGenerator): RandomIterator<T>;
}
