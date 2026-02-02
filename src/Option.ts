import { Reaction } from './Reaction';
import { ScriptManager } from './ScriptManager';
import { Prerequisite } from './Prerequisite';
import { Encounter } from './Encounter';

export class Option {
    public id: string = '';
    public text: string = '';
    public reactions: Reaction[] = [];
    public prerequisites: Prerequisite[] = [];
    public occurrences: number = 0;
    public visibility_script: ScriptManager = new ScriptManager();
    public performability_script: ScriptManager = new ScriptManager();
    public parent_encounter: Encounter | null = null;
    public stored_index: number | null = null;

    constructor(text: string = '', id: string = '') {
        this.text = text;
        this.id = id;
    }

    public get_index(): number {
        if (this.parent_encounter) {
            return this.parent_encounter.options.indexOf(this);
        }
        return this.stored_index ?? -1;
    }

    public compile(): any {
        return {
            id: this.id,
            text_script: {
                script_element_type: 'Pointer',
                pointer_type: 'String Constant',
                value: this.text,
            },
            reactions: this.reactions.map((reaction) => reaction.compile()),
        };
    }
}
