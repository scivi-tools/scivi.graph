declare module 'ngraph.merge' {
    function NgraphMerge<T extends object>(target: Partial<T>, options: T) : T;
    function NgraphMerge<T extends object>(target?: Partial<T>) : object;
    export = NgraphMerge;
}
