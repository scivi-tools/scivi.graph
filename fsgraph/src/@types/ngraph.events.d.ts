// @ts-check
declare namespace NgraphEvents {

    export type EventCallback =
        /** 
         * @param this Stores context for concrete callback, if present
         * @param args Rest arguments sent via fire()
         */
        (this : any, ...args : any[]) => void;

    export interface EventifiedObject {
        on(eventName: string, callback: EventCallback, context?: any),
        off(eventName: string | undefined, callback?: EventCallback),
        fire(eventName: string, ...args : any[])
    }

}

declare function NgraphEvents(params : Object) : NgraphEvents.EventifiedObject;

declare module 'ngraph.events' {
    export = NgraphEvents;
}
