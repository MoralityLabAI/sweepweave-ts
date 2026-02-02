import { Reaction } from './Reaction'; // Forward declaration, will create Reaction.ts next

/**
 * STUB
 * This is a placeholder for the Option class.
 * It will be replaced with a full implementation when Option.gd is ported.
 */
export class Option {
    public text: string = '';
    public reactions: Reaction[] = []; // Array of Reaction stubs

    constructor(text: string = '') {
        this.text = text;
    }

    public get_index(): number {
        console.warn("STUB: Option.get_index called");
        return -1; // Placeholder
    }
}
