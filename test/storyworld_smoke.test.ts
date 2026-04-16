import { Storyworld } from '../src/Storyworld';
import { StoryworldIO } from '../src/StoryworldIO';
import { StoryworldSerializer } from '../src/StoryworldSerializer';

describe('Storyworld smoke load/serialize (v0.0.21)', () => {
  it('loads minimal fixture and serializes without throwing', () => {
    const fixture = {
      IFID: 'SW-TEST-0001',
      storyworld_title: 'Smoke Test',
      storyworld_author: 'Tester',
      sweepweave_version: '0.0.21',
      multiplayer: 2,
      turns: ['char_1', 'char_1'],
      creation_time: 1700000000,
      modified_time: 1700000000,
      debug_mode: false,
      display_mode: 1,
      characters: [
        {
          id: 'char_1',
          name: 'Alpha',
          pronoun: 'they',
          bnumber_properties: {
            Trust: 0.25,
          },
        },
      ],
      authored_properties: [
        {
          id: 'Trust',
          property_name: 'Trust',
          property_type: 'bounded number',
          default_value: 0,
          depth: 0,
          attribution_target: 'all cast members',
          affected_characters: [],
        },
      ],
      spools: [
        {
          id: 'spool_main',
          spool_type: 'General',
          active_at_start: true,
        },
      ],
      encounters: [
        {
          id: 'enc_1',
          title: 'Opening',
          connected_spools: ['spool_main'],
          earliest_turn: 0,
          latest_turn: 999,
          text_script: {
            script_element_type: 'Pointer',
            pointer_type: 'String Constant',
            value: 'Hello world.',
          },
          options: [
            {
              id: 'opt_1',
              text_script: {
                script_element_type: 'Pointer',
                pointer_type: 'String Constant',
                value: 'Respond.',
              },
              reactions: [
                {
                  id: 'rxn_1',
                  text_script: {
                    script_element_type: 'Pointer',
                    pointer_type: 'String Constant',
                    value: 'The world answers back.',
                  },
                  consequence_id: 'enc_1',
                  after_effects: [],
                },
              ],
            },
          ],
        },
      ],
      unique_id_seeds: {
        character: 1,
        encounter: 1,
        option: 1,
        reaction: 1,
        spool: 1,
        authored_property: 1,
      },
    };

    const storyworld = new Storyworld();
    const ok = StoryworldIO.load_into_storyworld(storyworld, JSON.stringify(fixture));
    expect(ok).toBe(true);
    expect(storyworld.characters.length).toBe(1);
    expect(storyworld.authored_properties.length).toBe(1);
    expect(storyworld.encounters.length).toBe(1);
    expect(storyworld.spools.length).toBe(1);
    expect(storyworld.multiplayer).toBe(2);
    expect(storyworld.turns).toEqual(['char_1', 'char_1']);

    expect(() => StoryworldSerializer.to_project_dict(storyworld)).not.toThrow();
  });
});
