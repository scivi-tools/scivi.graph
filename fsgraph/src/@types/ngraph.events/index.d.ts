
declare namespace NgraphEvents {

    export type EventCallback =
        /** 
         * @param this Stores context for concrete callback, if present
         * @param args Rest arguments sent via fire()
         */
        (this : any, ...args : any[]) => void;

    export interface EventifiedObject {
        on(eventName: string, callback: EventCallback, context?: any): this,
        off(eventName: string | undefined, callback?: EventCallback): this,
        fire(eventName: string, ...args : any[]): this
    }
}

/**
 * 
 * @param {} params Object to extend 
 * @returns {} Same object that implements EventifiedObject interface
 */
declare function NgraphEvents<T extends object>(params: T): NgraphEvents.EventifiedObject & T;

declare module 'ngraph.events' {
    export = NgraphEvents;
}
