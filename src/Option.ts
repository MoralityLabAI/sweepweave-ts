import { Reaction } from './Reaction';
import { ScriptManager } from './ScriptManager';

export class Option {
    public text: string = '';
    public reactions: Reaction[] = [];
    public occurrences: number = 0;
    public visibility_script: ScriptManager = new ScriptManager();
    public performability_script: ScriptManager = new ScriptManager();

    constructor(text: string = '') {
        this.text = text;
    }

    public get_index(): number {
        console.warn("STUB: Option.get_index called");
        return -1; // Placeholder
    }
}
