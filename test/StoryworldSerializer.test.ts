import { Storyworld } from '../src/Storyworld';
import { StoryworldSerializer } from '../src/StoryworldSerializer';
import { Actor } from '../src/Actor';
import { BNumberBlueprint } from '../src/BNumberBlueprint';
import { Encounter } from '../src/Encounter';
import { Spool } from '../src/Spool';

describe('StoryworldSerializer', () => {
    let storyworld: Storyworld;

    beforeEach(() => {
        storyworld = new Storyworld();
        storyworld.ifid = 'test-ifid';
        storyworld.storyworld_title = 'Test Title';
        storyworld.storyworld_author = 'Test Author';
        storyworld.sweepweave_version_number = '0.1.9';
        storyworld.storyworld_debug_mode_on = true; // Corrected property name
        storyworld.storyworld_display_mode = 'light';
        storyworld.creation_time = 12345;
        storyworld.modified_time = 67890;
        storyworld.multiplayer = 3;
        storyworld.turns = ['char_test1', 'char_test2', 'char_test3'];
        storyworld.multiplayer_is_explicit = true;
        storyworld.unique_id_seeds = {
            character: 1,
            encounter: 2,
            option: 3,
            reaction: 4,
            spool: 5,
            authored_property: 6
        };

        const actor = new Actor('char_test1', 'Test Character 1');
        storyworld.characters.push(actor);

        const bp = new BNumberBlueprint(storyworld, 'TestProp', 'test_prop_id', 0, 0);
        storyworld.authored_properties.push(bp);

        const encounter = new Encounter('enc_test1', 'Test Encounter 1');
        storyworld.encounters.push(encounter);

        const spool = new Spool('spool_test1');
        storyworld.spools.push(spool);
    });

    it('should correctly serialize a Storyworld object to a project dictionary', () => {
        const serializedData = StoryworldSerializer.to_project_dict(storyworld);

        expect(serializedData.IFID).toBe('test-ifid');
        expect(serializedData.storyworld_title).toBe('Test Title');
        expect(serializedData.storyworld_author).toBe('Test Author');
        expect(serializedData.sweepweave_version).toBe('0.1.9');
        expect(serializedData.debug_mode).toBe(true);
        expect(serializedData.display_mode).toBe('light');
        expect(serializedData.multiplayer).toBe(3);
        expect(serializedData.turns).toEqual(['char_test1', 'char_test2', 'char_test3']);
        expect(serializedData.creation_time).toBe(12345);
        expect(serializedData.modified_time).toBe(67890);
        expect(serializedData.unique_id_seeds).toEqual({
            character: 1,
            encounter: 2,
            option: 3,
            reaction: 4,
            spool: 5,
            authored_property: 6
        });

        // Check array lengths, assuming compile methods return basic objects
        expect(serializedData.characters.length).toBe(1);
        expect(serializedData.characters[0].id).toBe('char_test1'); // Assuming Actor.compile returns { id: ... }

        expect(serializedData.authored_properties.length).toBe(1);
        expect(serializedData.authored_properties[0].id).toBe('test_prop_id'); // Assuming BNumberBlueprint.compile returns { id: ... }

        expect(serializedData.encounters.length).toBe(1);
        expect(serializedData.encounters[0].id).toBe('enc_test1'); // Assuming Encounter.compile returns { id: ... }

        expect(serializedData.spools.length).toBe(1);
        expect(serializedData.spools[0].id).toBe('spool_test1'); // Assuming Spool.compile returns { id: ... }
    });

    // TODO: Add tests for more complex compile outputs if needed
    // TODO: Add tests for empty storyworld
    // TODO: Add tests for various data types in properties
});
