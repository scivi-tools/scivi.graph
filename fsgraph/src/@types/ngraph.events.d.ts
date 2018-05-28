// @ts-check
declare namespace NgraphEvents {

    export type EventCallback =
        /** 
         * @param this Stores context for concrete callback, if present
         * @param args Rest arguments sent via fire()
         */
        (this : any, ...args : any[]) => void;

    export interface EventifiedObject<T> extends T {
        on(eventName: string, callback: EventCallback, context?: any): EventifiedObject<T>,
        off(eventName: string | undefined, callback?: EventCallback): EventifiedObject<T>,
        fire(eventName: string, ...args : any[]): EventifiedObjectt<T>
    }

}

declare function NgraphEvents<T>(params: T): NgraphEvents.EventifiedObject<T>;

declare module 'ngraph.events' {
    export = NgraphEvents;
}
