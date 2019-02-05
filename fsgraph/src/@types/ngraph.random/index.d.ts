declare namespace Ngraph {
    namespace Random {
        export interface Random {
            next(maxValue: number): number
        }

        export type RandomIteratorCallback<T> = (item: T) => void;

        export interface RandomIterator<T> {
            forEach(callback: RandomIteratorCallback<T>): void;
            shuffle(): T[];
        }
    }
}

declare interface NgraphRandom extends Ngraph.Random.Random {
    nextDouble(): number;
}

declare module 'ngraph.random' {
    export function random(seed?: number): NgraphRandom;
    export function randomIterator<T>(values: T[], random?: Ngraph.Random.Random): Ngraph.Random.RandomIterator<T>;
}
