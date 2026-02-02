import { Encounter } from "./Encounter";
import { SWScriptElement } from "./SWScriptElement";
import { Option } from "./Option";
import { Prerequisite } from "./Prerequisite";
import { ScriptManager } from "./ScriptManager";

export class Reaction {
    public id: string = '';
    public text: string = '';
    public occurrences: number = 0;
    public consequence: Encounter | null = null;
    public consequence_id: string | null = null;
    public after_effects: SWScriptElement[] = [];
    public prerequisites: Prerequisite[] = [];
    public weight: number = 1;
    public parent_option: Option | null = null;
    public stored_index: number | null = null;
    public desirability_script: ScriptManager = new ScriptManager();

    constructor(text: string = '', id: string = '') {
        this.text = text;
        this.id = id;
    }

    public get_index(): number {
        if (this.parent_option) {
            return this.parent_option.reactions.indexOf(this);
        }
        return this.stored_index ?? -1;
    }

    public calculate_desirability(): number {
        console.warn("STUB: Reaction.calculate_desirability called");
        return 0; // Placeholder
    }

    public compile(): any {
        return {
            id: this.id,
            text_script: {
                script_element_type: 'Pointer',
                pointer_type: 'String Constant',
                value: this.text,
            },
            consequence_id: this.consequence ? this.consequence.id : this.consequence_id,
            weight: this.weight,
            desirability_script: this.desirability_script.compile(),
            after_effects: this.after_effects.map((effect) => effect.compile()),
        };
    }
}
