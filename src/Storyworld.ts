import { Actor } from './Actor';
import { BNumberBlueprint } from './BNumberBlueprint';
import { Encounter } from './Encounter';
import { Spool } from './Spool';

export class Storyworld {
    public character_directory: Map<string, Actor> = new Map();
    public spool_directory: Map<string, Spool> = new Map();
    public encounter_directory: Map<string, Encounter> = new Map();
    public characters: Actor[] = [];
    public authored_properties: BNumberBlueprint[] = [];
    public encounters: Encounter[] = [];
    public spools: Spool[] = [];
    public unique_id_seeds: number[] = [];
    public storyworld_title: string = "";
    public storyworld_author: string = "";
    public storyworld_debug_mode_on: boolean = false;
    public storyworld_display_mode: string = "";
    public sweepweave_version_number: string = "";
    public creation_time: number = 0;
    public modified_time: number = 0;
    public ifid: string = "";

    public clear(): void {
        this.character_directory.clear();
        this.spool_directory.clear();
        this.encounter_directory.clear();
        this.characters = [];
        this.authored_properties = [];
        this.encounters = [];
        this.spools = [];
        this.unique_id_seeds = [];
        this.storyworld_title = "";
        this.storyworld_author = "";
        this.storyworld_debug_mode_on = false;
        this.storyworld_display_mode = "";
        this.sweepweave_version_number = "";
        this.creation_time = 0;
        this.modified_time = 0;
        this.ifid = "";
    }

    public set_as_copy_of(original: Storyworld): void {
        this.clear();
        this.storyworld_title = original.storyworld_title;
        this.storyworld_author = original.storyworld_author;
        this.storyworld_debug_mode_on = original.storyworld_debug_mode_on;
        this.storyworld_display_mode = original.storyworld_display_mode;
        this.sweepweave_version_number = original.sweepweave_version_number;
        this.creation_time = original.creation_time;
        this.modified_time = original.modified_time;
        this.ifid = original.ifid;
        this.unique_id_seeds = [...original.unique_id_seeds];

        for (const character of original.characters) {
            const new_character = new Actor();
            new_character.set_as_copy_of(character);
            this.characters.push(new_character);
            this.character_directory.set(new_character.id, new_character);
        }

        for (const authored_property of original.authored_properties) {
            const new_authored_property = new BNumberBlueprint(this, authored_property.property_name, authored_property.id, authored_property.depth, authored_property.default_value);
            new_authored_property.set_as_copy_of(authored_property);
            this.authored_properties.push(new_authored_property);
        }

        for (const original_encounter of original.encounters) {
            const new_encounter = new Encounter();
            new_encounter.set_as_copy_of(original_encounter);
            this.encounters.push(new_encounter);
            this.encounter_directory.set(new_encounter.id, new_encounter);
        }

        for (const spool of original.spools) {
            const new_spool = new Spool();
            new_spool.set_as_copy_of(spool);
            this.spools.push(new_spool);
            this.spool_directory.set(new_spool.id, new_spool);
        }
    }

    public load_from_dict_v0_0_07_through_v0_0_15(): void {
        // Implement this method
    }

    public load_from_dict_v0_0_21(): void {
        // Implement this method
    }
}
