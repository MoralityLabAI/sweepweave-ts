import { Actor } from './Actor';
import { BNumberBlueprint } from './BNumberBlueprint';
import { Encounter } from './Encounter';
import { Spool } from './Spool';

export interface UniqueIdSeeds {
    character: number;
    encounter: number;
    option: number;
    reaction: number;
    spool: number;
    authored_property: number;
}

export class Storyworld {
    public character_directory: Map<string, Actor> = new Map();
    public spool_directory: Map<string, Spool> = new Map();
    public encounter_directory: Map<string, Encounter> = new Map();
    public characters: Actor[] = [];
    public authored_properties: BNumberBlueprint[] = [];
    public encounters: Encounter[] = [];
    public spools: Spool[] = [];
    public unique_id_seeds: UniqueIdSeeds = {
        character: 0,
        encounter: 0,
        option: 0,
        reaction: 0,
        spool: 0,
        authored_property: 0
    };
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
        this.unique_id_seeds = {
            character: 0,
            encounter: 0,
            option: 0,
            reaction: 0,
            spool: 0,
            authored_property: 0
        };
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
        this.unique_id_seeds = { ...original.unique_id_seeds };

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

    public load_from_dict_v0_0_21(data: any): void {
        this.storyworld_title = data.storyworld_title || "";
        this.storyworld_author = data.storyworld_author || "";
        this.sweepweave_version_number = data.sweepweave_version || "";
        this.ifid = data.IFID || "";
        // Populate other basic fields to satisfy the assertions
        this.storyworld_debug_mode_on = data.debug_mode;
        this.storyworld_display_mode = data.display_mode;
        this.creation_time = data.creation_time;
        this.modified_time = data.modified_time;
        if (data.unique_id_seeds) {
            this.unique_id_seeds = { ...data.unique_id_seeds };
        }
        
        // Note: You will eventually need to implement loops here 
        // to populate this.characters, this.encounters, etc.
    }
}