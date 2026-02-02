import { SWPointer } from './SWPointer';
import { sw_script_data_types } from './SWScriptElement';
import { Actor } from './Actor';
import { Storyworld } from './Storyworld';

/**
 * A pointer to a Bounded Number (BNumber) property on an Actor.
 * Ported from Godot/GDScript.
 */
export class BNumberPointer extends SWPointer {
    public character: Actor | null = null;
    public coefficient: number = 1;
    public keyring: any[] = [];

    constructor(in_character: Actor | null = null, in_keyring: any[] = []) {
        super();
        this.pointer_type = "Bounded Number Pointer";
        this.output_type = sw_script_data_types.BNUMBER;
        this.character = in_character;
        this.keyring = [...in_keyring]; // .duplicate() is a shallow copy
    }

    public override get_value(leaf: any = null): number | undefined {
        if (this.character instanceof Actor) {
            return this.coefficient * this.character.get_bnumber_property(this.keyring);
        }
    }

    public set_value(value: number): void {
        if (this.character instanceof Actor) {
            this.character.set_bnumber_property(this.keyring, value);
        }
    }

    public get_ap_blueprint(): any {
        if (this.character === null || this.keyring.length === 0) {
            return null;
        }
        const property_id = this.keyring[0];
        if (!this.character.authored_property_directory.has(property_id)) {
            return null;
        }
        return this.character.authored_property_directory.get(property_id);
    }

    public get_bnumber_name(): string {
        if (this.character === null || this.keyring.length === 0) {
            return "";
        }
        const property_blueprint = this.get_ap_blueprint();
        if (property_blueprint === null) {
            return "";
        }
        // Assuming get_property_name exists on the blueprint object
        return property_blueprint.get_property_name();
    }

    public get_character_name_from_id(character_id: string): string {
        const storyworld = this.character?.storyworld as Storyworld;
        if (storyworld === null) {
            return "unknown_character";
        } else if (!storyworld.character_directory.has(character_id)) {
            return "unknown_character";
        } else {
            return storyworld.character_directory.get(character_id)!.char_name;
        }
    }

    public override compile(parent_storyworld: Storyworld, include_editor_only_variables: boolean = false): Record<string, any> {
        const output: Record<string, any> = {};
        output["script_element_type"] = "Pointer";
        output["pointer_type"] = this.pointer_type;
        output["coefficient"] = this.coefficient;

        if (!this.character) {
            // Handle null character case
            output["character"] = -1;
            output["keyring"] = [];
            return output;
        }
        
        if (include_editor_only_variables) {
            output["character"] = this.character.id;
            output["keyring"] = [...this.keyring];
        } else {
            output["character"] = this.character.get_index();
            output["keyring"] = [];
            if (this.keyring.length > 0 && this.character.authored_property_directory.has(this.keyring[0])) {
                for (let key_index = 0; key_index < this.keyring.length; key_index++) {
                    const key = this.keyring[key_index];
                    if (key_index === 0) {
                        output["keyring"].push(key);
                    } else if (parent_storyworld.character_directory.has(key)) {
                        output["keyring"].push(parent_storyworld.character_directory.get(key)!.get_index());
                    }
                }
            }
        }
        return output;
    }

    public set_as_copy_of(original: BNumberPointer): void {
        this.character = original.character;
        this.coefficient = original.coefficient;
        this.keyring = [...original.keyring];
    }

    public replace_character_with_character(search_term: Actor, replacement: Actor): void {
        if (this.character instanceof Actor && search_term instanceof Actor && replacement instanceof Actor) {
            if (this.character.id === search_term.id) {
                this.character = replacement;
            }
            this.keyring = this.keyring.map(key => (key === search_term.id ? replacement.id : key));
        }
    }

    public override remap(to_storyworld: Storyworld): boolean {
        if (this.character && to_storyworld.character_directory.has(this.character.id)) {
            this.character = to_storyworld.character_directory.get(this.character.id)!;
            return true;
        } else {
            this.character = null;
            return false;
        }
    }

    public override data_to_string(): string {
        if (!(this.character instanceof Actor) || this.keyring.length === 0) {
            return "Invalid BNumberPointer";
        }
        let text = "";
        if (this.coefficient !== 1) {
            text += `${this.coefficient} * `;
        }
        text += `${this.character.char_name} [`;
        for (let index = 0; index < this.keyring.length; index++) {
            if (index === 0) {
                text += this.get_bnumber_name();
            } else {
                const character_id = this.keyring[index];
                text += ", " + this.get_character_name_from_id(character_id);
            }
        }
        text += "] (";
        text += this.character.get_bnumber_property(this.keyring);
        text += ")";
        return text;
    }
}
