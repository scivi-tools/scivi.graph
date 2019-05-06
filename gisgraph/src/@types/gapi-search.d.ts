declare namespace google.search {
    interface CSEElement {
        gname: string;
        type: string;
        uiOptions: any;
        execute(query: string): void;
        prefillQuery(query: string): void;
        getInputQuery(): string;
        clearAllResults(): void;
    }

    const cse: {
        element: {
            getElement(_: string): CSEElement;
            // ...
        }
    }
}