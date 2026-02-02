import { Encounter } from "./Encounter";
import { SWScriptElement } from "./SWScriptElement";

export class Reaction {
    public text: string = '';
    public occurrences: number = 0;
    public consequence: Encounter | null = null;
    public after_effects: SWScriptElement[] = [];

    constructor(text: string = '') {
        this.text = text;
    }

    public get_index(): number {
        console.warn("STUB: Reaction.get_index called");
        return -1; // Placeholder
    }

    public calculate_desirability(): number {
        console.warn("STUB: Reaction.calculate_desirability called");
        return 0; // Placeholder
    }
}
