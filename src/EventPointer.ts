import { SWPointer } from './SWPointer';
import { sw_script_data_types } from './SWScriptElement';
import { Spool } from './Spool';
import { Encounter } from './Encounter';
import { Option } from './Option';
import { Reaction } from './Reaction';
import { Storyworld } from './Storyworld'; // For remap and compile

/**
 * This pointer tests whether or not an event has occurred in the story history.
 * Ported from Godot/GDScript.
 */
export class EventPointer extends SWPointer {
    public negated: boolean = false; // Do we negate the result of the evaluation?
    public spool: Spool | null = null;
    public encounter: Encounter | null = null; // Only for historybook lookups. Translated into a string for interpreter.
    public option: Option | null = null; // Only for historybook lookups. Translated into a numerical index for interpreter.
    public reaction: Reaction | null = null; // Only for historybook lookups. Translated into a numerical index for interpreter.

    constructor(in_encounter: Encounter | null = null, in_option: Option | null = null, in_reaction: Reaction | null = null) {
        super();
        this.pointer_type = "Event Pointer";
        this.output_type = sw_script_data_types.BOOLEAN;
        this.encounter = in_encounter;
        this.option = in_option;
        this.reaction = in_reaction;
    }

    public override clear(): void {
        this.negated = false;
        this.spool = null;
        this.encounter = null;
        this.option = null;
        this.reaction = null;
    }

    /**
     * Checks whether an event (encounter, option, reaction) has occurred on the current branch.
     * This is a stub implementation as the full "historybook" (leaf) is not yet ported.
     * @param leaf The current node in the historybook (stubbed).
     */
    public has_occurred_on_branch(leaf: any): boolean | null {
        // --- STUB IMPLEMENTATION ---
        // The original GDScript traversed a Node tree (historybook) here.
        // For now, we return false, but the structure for checking specific encounters/options/reactions
        // would be based on the logic below once 'leaf' is a proper HistorybookNode.
        
        // Original GDScript logic:
        // if (null == encounter) return null;
        // else if (null == leaf) return false; // Playthrough has only just begun.

        // var node = leaf;
        // while (null != node) {
        //     if (null != node.get_metadata(0).encounter && node.get_metadata(0).encounter == encounter) {
        //         if (option == null && reaction == null) return true;
        //         if (option == node.get_metadata(0).player_choice && reaction == null) return true;
        //         if (option == null && reaction == node.get_metadata(0).antagonist_choice) return true;
        //         if (option == node.get_metadata(0).player_choice && reaction == node.get_metadata(0).antagonist_choice) return true;
        //     }
        //     node = node.get_parent(); // Traverse up the history tree
        // }
        
        // For the stub, we just assume it hasn't occurred.
        if (this.encounter === null) return null; // Can't check for a null encounter
        return false;
    }

    public override get_value(leaf: any = null): boolean | null {
        const has_occurred = this.has_occurred_on_branch(leaf);
        if (this.negated === null || has_occurred === null) {
            return null;
        } else if (this.negated !== has_occurred) {
            return true;
        } else {
            return false;
        }
    }

    public override data_to_string(): string {
        return this.summarize();
    }

    public summarize(): string {
        let output = "";
        if (!this.negated) {
            output += "Event has occurred: ";
        } else {
            output += "Event has not occurred: ";
        }

        if (this.encounter) {
            output += this.encounter.title;
        } else {
            output += "Null Encounter";
        }

        if (this.option) {
            output += ` / ${this.option.text.substring(0, 25)}`;
        } else {
            output += " / Null Option";
        }

        if (this.reaction) {
            output += ` / ${this.reaction.text.substring(0, 25)}`;
        } else {
            output += " / Null Reaction";
        }
        output += ".";
        return output;
    }

    public override compile(parent_storyworld: Storyworld, include_editor_only_variables: boolean = false): Record<string, any> {
        const output: Record<string, any> = {};
        output["script_element_type"] = "Pointer";
        output["pointer_type"] = this.pointer_type;
        output["negated"] = this.negated;
        
        output["spool"] = this.spool ? this.spool.id : null;
        output["encounter"] = this.encounter ? this.encounter.id : null;
        output["option"] = this.option ? this.option.get_index() : -1;
        output["reaction"] = this.reaction ? this.reaction.get_index() : -1;
        
        return output;
    }

    public set_as_copy_of(original: EventPointer): void {
        this.negated = original.negated;
        this.spool = original.spool;
        this.encounter = original.encounter;
        this.option = original.option;
        this.reaction = original.reaction;
    }

    public override remap(storyworld: Storyworld): boolean {
        let success = true;

        if (this.spool) {
            if (storyworld.spool_directory.has(this.spool.id)) {
                this.spool = storyworld.spool_directory.get(this.spool.id)!;
            } else {
                this.clear();
                return false; // Spool not found
            }
        }
        
        if (this.encounter) {
            if (storyworld.encounter_directory.has(this.encounter.id)) {
                this.encounter = storyworld.encounter_directory.get(this.encounter.id)!;
                if (this.option) {
                    const optionIndex = this.option.get_index(); // Using index from original option
                    if (optionIndex !== -1 && optionIndex < this.encounter.options.length) {
                        this.option = this.encounter.options[optionIndex];
                        if (this.reaction) {
                            const reactionIndex = this.reaction.get_index(); // Using index from original reaction
                            if (reactionIndex !== -1 && reactionIndex < this.option.reactions.length) {
                                this.reaction = this.option.reactions[reactionIndex];
                            } else {
                                this.reaction = null; // Reaction not found or invalid index
                            }
                        }
                    } else {
                        this.option = null; // Option not found or invalid index
                        this.reaction = null;
                    }
                } else {
                    this.reaction = null; // No option, so no reaction
                }
            } else {
                this.clear();
                return false; // Encounter not found
            }
        } else {
            this.option = null;
            this.reaction = null;
        }
        
        return success;
    }
}
