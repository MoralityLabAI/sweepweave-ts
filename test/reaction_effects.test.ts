import { Reaction } from '../src/Reaction';
import { Effect, reorderEffects } from '../src/Effect';
import { Storyworld } from '../src/Storyworld';
import { StoryworldSerializer } from '../src/StoryworldSerializer';
import { StoryworldIO } from '../src/StoryworldIO';
import { Encounter } from '../src/Encounter';
import { Option } from '../src/Option';

describe('Reaction scripts and effects', () => {
  it('persists inclination_script through serialization', () => {
    const storyworld = new Storyworld();
    storyworld.sweepweave_version_number = '0.0.21';
    const encounter = new Encounter('enc_1', 'Encounter');
    const option = new Option('Option', 'opt_1');
    const reaction = new Reaction('Reaction', 'rxn_1');
    reaction.inclination_script = {
      type: 'Proximity',
      left: { type: 'Constant', value: 0.2 },
      right: { type: 'Constant', value: 0.7 },
    };
    option.parent_encounter = encounter;
    reaction.parent_option = option;
    option.reactions.push(reaction);
    encounter.options.push(option);
    storyworld.encounters.push(encounter);
    storyworld.encounter_directory.set(encounter.id, encounter);

    const serialized = StoryworldSerializer.to_project_dict(storyworld);
    const reloaded = new Storyworld();
    const ok = StoryworldIO.load_into_storyworld(reloaded, JSON.stringify(serialized));
    expect(ok).toBe(true);
    const loadedReaction = reloaded.encounters[0]?.options[0]?.reactions[0];
    expect(loadedReaction?.inclination_script).toEqual(reaction.inclination_script);
  });

  it('reorders effects without mutation', () => {
    const effects: Effect[] = [
      { type: 'NextPage', encounterId: 'a' },
      { type: 'NextPage', encounterId: 'b' },
      { type: 'NextPage', encounterId: 'c' },
    ];
    const reordered = reorderEffects(effects, 0, 2);
    expect(reordered[2].encounterId).toBe('a');
    expect(effects[0].encounterId).toBe('a');
  });
});
