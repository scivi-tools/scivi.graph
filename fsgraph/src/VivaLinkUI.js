//@ts-check
import { VivaBaseUI } from './VivaBaseUI'
import { Edge } from './Edge'

export class VivaLinkUI extends VivaBaseUI {
    constructor(graphics, edge) {
        super(edge.id);
    }
};
