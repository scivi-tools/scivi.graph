
declare namespace NgraphMerge {}
declare function NgraphMerge<T extends object>(target: Partial<T>, options: T) : T;
declare function NgraphMerge<T extends object>(target?: Partial<T>) : object;

declare module 'ngraph.merge' {
    export = NgraphMerge;
}
