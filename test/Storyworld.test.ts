import { Storyworld } from '../src/Storyworld';
import { Actor } from '../src/Actor';
import { BNumberBlueprint } from '../src/BNumberBlueprint';
import { Encounter } from '../src/Encounter';
import { Spool } from '../src/Spool';

describe('Storyworld', () => {
    let storyworld: Storyworld;

    beforeEach(() => {
        storyworld = new Storyworld();
    });

    it('should be instantiated with default values', () => {
        expect(storyworld.ifid).toBe('');
        expect(storyworld.storyworld_title).toBe('');
        expect(storyworld.storyworld_author).toBe('');
        expect(storyworld.sweepweave_version_number).toBe('');
        expect(storyworld.characters).toEqual([]);
        expect(storyworld.authored_properties).toEqual([]);
        expect(storyworld.encounters).toEqual([]);
        expect(storyworld.spools).toEqual([]);
        expect(storyworld.unique_id_seeds).toEqual({
            character: 0,
            encounter: 0,
            option: 0,
            reaction: 0,
            spool: 0,
            authored_property: 0
        });
    });

    it('should clear all its properties when clear() is called', () => {
        storyworld.ifid = 'test-ifid';
        storyworld.storyworld_title = 'Test Title';
        storyworld.characters.push(new Actor('char1', 'Character 1'));
        storyworld.unique_id_seeds.character = 5;

        storyworld.clear();

        expect(storyworld.ifid).toBe('');
        expect(storyworld.storyworld_title).toBe('');
        expect(storyworld.characters).toEqual([]);
        expect(storyworld.unique_id_seeds).toEqual({
            character: 0,
            encounter: 0,
            option: 0,
            reaction: 0,
            spool: 0,
            authored_property: 0
        });
    });

    it('should correctly set properties as a copy of another storyworld', () => {
        const originalStoryworld = new Storyworld();
        originalStoryworld.ifid = 'original-ifid';
        originalStoryworld.storyworld_title = 'Original Title';
        originalStoryworld.storyworld_author = 'Original Author';
        originalStoryworld.sweepweave_version_number = '0.1.0';
        originalStoryworld.unique_id_seeds = { ...originalStoryworld.unique_id_seeds, character: 10 };

        const actor1 = new Actor('char_orig1', 'Original Char 1');
        originalStoryworld.characters.push(actor1);
        originalStoryworld.character_directory.set(actor1.id, actor1);

        const bp1 = new BNumberBlueprint(originalStoryworld, 'Prop1', 'prop_id1', 0, 0);
        originalStoryworld.authored_properties.push(bp1);

        const encounter1 = new Encounter('enc_orig1', 'Original Encounter 1');
        originalStoryworld.encounters.push(encounter1);
        originalStoryworld.encounter_directory.set(encounter1.id, encounter1);
        
        const spool1 = new Spool('spool_orig1');
        originalStoryworld.spools.push(spool1);
        originalStoryworld.spool_directory.set(spool1.id, spool1);

        storyworld.set_as_copy_of(originalStoryworld);

        expect(storyworld.ifid).toBe('original-ifid');
        expect(storyworld.storyworld_title).toBe('Original Title');
        expect(storyworld.storyworld_author).toBe('Original Author');
        expect(storyworld.sweepweave_version_number).toBe('0.1.0');
        expect(storyworld.unique_id_seeds).toEqual({ ...originalStoryworld.unique_id_seeds, character: 10 });
        
        expect(storyworld.characters.length).toBe(1);
        expect(storyworld.characters[0].id).toBe('char_orig1');
        expect(storyworld.character_directory.has('char_orig1')).toBe(true);

        expect(storyworld.authored_properties.length).toBe(1);
        expect(storyworld.authored_properties[0].id).toBe('prop_id1');

        expect(storyworld.encounters.length).toBe(1);
        expect(storyworld.encounters[0].id).toBe('enc_orig1');
        expect(storyworld.encounter_directory.has('enc_orig1')).toBe(true);

        expect(storyworld.spools.length).toBe(1);
        expect(storyworld.spools[0].id).toBe('spool_orig1');
        expect(storyworld.spool_directory.has('spool_orig1')).toBe(true);

        // Ensure deep copy for object properties like unique_id_seeds
        originalStoryworld.unique_id_seeds.character = 99;
        expect(storyworld.unique_id_seeds.character).toBe(10);
    });

    it('should correctly load properties from a data dictionary using load_from_dict_v0_0_21', () => {
        const data = {
            IFID: 'loaded-ifid',
            storyworld_title: 'Loaded Title',
            storyworld_author: 'Loaded Author',
            sweepweave_version: '0.0.21',
            debug_mode: true,
            display_mode: 'dark',
            creation_time: 12345,
            modified_time: 67890,
            unique_id_seeds: {
                character: 20,
                encounter: 20,
                option: 20,
                reaction: 20,
                spool: 20,
                authored_property: 20
            }
        };

        storyworld.load_from_dict_v0_0_21(data);

        expect(storyworld.ifid).toBe('loaded-ifid');
        expect(storyworld.storyworld_title).toBe('Loaded Title');
        expect(storyworld.storyworld_author).toBe('Loaded Author');
        expect(storyworld.sweepweave_version_number).toBe('0.0.21');
        expect(storyworld.storyworld_debug_mode_on).toBe(true);
        expect(storyworld.storyworld_display_mode).toBe('dark');
        expect(storyworld.creation_time).toBe(12345);
        expect(storyworld.modified_time).toBe(67890);
        expect(storyworld.unique_id_seeds).toEqual({
            character: 20,
            encounter: 20,
            option: 20,
            reaction: 20,
            spool: 20,
            authored_property: 20
        });
    });

    // TODO: Add more tests for character, authored_property, encounter, spool management
});
