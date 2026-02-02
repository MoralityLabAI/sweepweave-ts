import { el } from '../dom';
import {
  Store,
  touchStoryworld,
  getSelectedEncounter,
  getSelectedOption,
  getSelectedReaction,
} from '../store';
import { Encounter } from '../../Encounter';
import { Option } from '../../Option';
import { Reaction } from '../../Reaction';
import { UUID } from '../../UUID';
import { BNumberConstant } from '../../BNumberConstant';
import { NudgeOperator } from '../../NudgeOperator';
import { SWScriptElement } from '../../SWScriptElement';
import { openScriptModal } from '../modals/ScriptModal';

function moveItem<T>(items: T[], from: number, to: number): void {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
  const [item] = items.splice(from, 1);
  items.splice(to, 0, item);
}

function formatEffect(effect: SWScriptElement): string {
  if (effect instanceof NudgeOperator) {
    return effect.data_to_string();
  }
  return effect.data_to_string();
}

export function renderEncountersTab(store: Store): HTMLElement {
  const state = store.getState();
  const storyworld = state.storyworld;
  const selectedEncounter = getSelectedEncounter(state);
  const selectedOption = getSelectedOption(state);
  const selectedReaction = getSelectedReaction(state);

  const container = el('div', { className: 'sw-encounters' });
  const leftCol = el('div', { className: 'sw-panel sw-col' });
  const centerCol = el('div', { className: 'sw-panel sw-col sw-col-center' });
  const rightCol = el('div', { className: 'sw-panel sw-col' });

  const encounterHeader = el('div', { className: 'sw-section-header' },
    el('span', { text: 'Encounters:' })
  );
  const encounterButtons = el('div', { className: 'sw-button-row' });
  const addEncounterBtn = el('button', { text: '+' });
  const removeEncounterBtn = el('button', { text: '-' });
  const duplicateEncounterBtn = el('button', { text: 'Duplicate' });
  encounterButtons.append(addEncounterBtn, removeEncounterBtn, duplicateEncounterBtn);

  const sortRow = el('div', { className: 'sw-sort-row' });
  const sortLabel = el('label', { text: 'Sort by:' });
  const sortSelect = el('select');
  sortSelect.append(
    el('option', { text: 'Alphabetical', attrs: { value: 'alphabetical' } }),
    el('option', { text: 'Created', attrs: { value: 'created' } })
  );
  const sortDirectionBtn = el('button', { text: 'A/Z' });
  const sortMoreBtn = el('button', { text: '⋮' });
  sortRow.append(sortLabel, sortSelect, sortDirectionBtn, sortMoreBtn);

  let sortAsc = true;
  sortDirectionBtn.addEventListener('click', () => {
    sortAsc = !sortAsc;
    sortDirectionBtn.textContent = sortAsc ? 'A/Z' : 'Z/A';
    store.setState({ storyworld });
  });
  sortSelect.addEventListener('change', () => store.setState({ storyworld }));

  const encounterSelect = el('select', { attrs: { size: '12' }, className: 'sw-listbox' }) as HTMLSelectElement;
  const encounters = [...storyworld.encounters];
  if (sortSelect.value === 'alphabetical') {
    encounters.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (!sortAsc) {
    encounters.reverse();
  }
  for (const encounter of encounters) {
    const option = el('option', { text: encounter.title || '(Untitled)', attrs: { value: encounter.id } }) as HTMLOptionElement;
    if (encounter.id === state.selections.encounterId) {
      option.selected = true;
    }
    encounterSelect.appendChild(option);
  }
  encounterSelect.addEventListener('change', () => {
    store.selectEncounter(encounterSelect.value || null);
  });

  addEncounterBtn.addEventListener('click', () => {
    const encounter = new Encounter(`enc_${UUID.v4()}`, 'New Encounter');
    storyworld.encounters.push(encounter);
    storyworld.encounter_directory.set(encounter.id, encounter);
    touchStoryworld(storyworld);
    store.selectEncounter(encounter.id);
  });
  removeEncounterBtn.addEventListener('click', () => {
    const encounter = getSelectedEncounter(store.getState());
    if (!encounter) return;
    storyworld.encounters = storyworld.encounters.filter((entry) => entry !== encounter);
    storyworld.encounter_directory.delete(encounter.id);
    for (const spool of storyworld.spools) {
      spool.encounter_ids = spool.encounter_ids.filter((id) => id !== encounter.id);
    }
    touchStoryworld(storyworld);
    store.selectEncounter(null);
  });
  duplicateEncounterBtn.addEventListener('click', () => {
    const encounter = getSelectedEncounter(store.getState());
    if (!encounter) return;
    const copy = new Encounter(`enc_${UUID.v4()}`, `${encounter.title} Copy`);
    copy.main_text = encounter.main_text;
    copy.connected_spool_ids = [...encounter.connected_spool_ids];
    copy.options = encounter.options.map((opt) => {
      const optionCopy = new Option(opt.text, `opt_${UUID.v4()}`);
      optionCopy.parent_encounter = copy;
      optionCopy.reactions = opt.reactions.map((rxn) => {
        const reactionCopy = new Reaction(rxn.text, `rxn_${UUID.v4()}`);
        reactionCopy.parent_option = optionCopy;
        reactionCopy.weight = rxn.weight;
        reactionCopy.after_effects = [...rxn.after_effects];
        return reactionCopy;
      });
      return optionCopy;
    });
    storyworld.encounters.push(copy);
    storyworld.encounter_directory.set(copy.id, copy);
    touchStoryworld(storyworld);
    store.selectEncounter(copy.id);
  });

  leftCol.append(encounterHeader, encounterButtons, sortRow, encounterSelect);

  const encounterTitle = el('input', {
    attrs: { type: 'text', value: selectedEncounter?.title ?? '' },
    className: 'sw-title-input',
  }) as HTMLInputElement;
  encounterTitle.addEventListener('input', () => {
    const encounter = getSelectedEncounter(store.getState());
    if (!encounter) return;
    encounter.title = encounterTitle.value;
    touchStoryworld(storyworld);
  });

  const encounterText = el('textarea', { attrs: { rows: '10' }, className: 'sw-textarea' }) as HTMLTextAreaElement;
  encounterText.value = selectedEncounter?.main_text ?? '';
  encounterText.addEventListener('input', () => {
    const encounter = getSelectedEncounter(store.getState());
    if (!encounter) return;
    encounter.main_text = encounterText.value;
    touchStoryworld(storyworld);
  });

  const optionsHeader = el('div', { className: 'sw-section-header' }, el('span', { text: 'Options:' }));
  const optionButtons = el('div', { className: 'sw-button-row' });
  const addOptionBtn = el('button', { text: '+' });
  const removeOptionBtn = el('button', { text: '-' });
  const optionUpBtn = el('button', { text: '↑' });
  const optionDownBtn = el('button', { text: '↓' });
  const optionHandBtn = el('button', { text: '☞' });
  optionButtons.append(addOptionBtn, removeOptionBtn, optionUpBtn, optionDownBtn, optionHandBtn);

  const optionList = el('select', { attrs: { size: '6' }, className: 'sw-listbox' }) as HTMLSelectElement;
  if (selectedEncounter) {
    for (const opt of selectedEncounter.options) {
      const optNode = el('option', { text: opt.text || '(Option)', attrs: { value: opt.id } }) as HTMLOptionElement;
      if (opt.id === state.selections.optionId) {
        optNode.selected = true;
      }
      optionList.appendChild(optNode);
    }
  }
  optionList.addEventListener('change', () => store.selectOption(optionList.value || null));

  const optionText = el('textarea', { attrs: { rows: '3' }, className: 'sw-textarea' }) as HTMLTextAreaElement;
  optionText.value = selectedOption?.text ?? '';
  optionText.addEventListener('input', () => {
    const option = getSelectedOption(store.getState());
    if (!option) return;
    option.text = optionText.value;
    const selectedIndex = optionList.selectedIndex;
    if (selectedIndex >= 0) {
      optionList.options[selectedIndex].text = option.text || '(Option)';
    }
    touchStoryworld(storyworld);
  });

  addOptionBtn.addEventListener('click', () => {
    const encounter = getSelectedEncounter(store.getState());
    if (!encounter) return;
    const option = new Option('New option', `opt_${UUID.v4()}`);
    option.parent_encounter = encounter;
    encounter.options.push(option);
    touchStoryworld(storyworld);
    store.selectOption(option.id);
  });
  removeOptionBtn.addEventListener('click', () => {
    const encounter = getSelectedEncounter(store.getState());
    const option = getSelectedOption(store.getState());
    if (!encounter || !option) return;
    encounter.options = encounter.options.filter((entry) => entry !== option);
    touchStoryworld(storyworld);
    store.selectOption(null);
  });
  optionUpBtn.addEventListener('click', () => {
    const encounter = getSelectedEncounter(store.getState());
    const option = getSelectedOption(store.getState());
    if (!encounter || !option) return;
    const index = encounter.options.indexOf(option);
    moveItem(encounter.options, index, index - 1);
    touchStoryworld(storyworld);
    store.selectOption(option.id);
  });
  optionDownBtn.addEventListener('click', () => {
    const encounter = getSelectedEncounter(store.getState());
    const option = getSelectedOption(store.getState());
    if (!encounter || !option) return;
    const index = encounter.options.indexOf(option);
    moveItem(encounter.options, index, index + 1);
    touchStoryworld(storyworld);
    store.selectOption(option.id);
  });

  centerCol.append(encounterTitle, encounterText, optionsHeader, optionButtons, optionList, optionText);

  const reactionsHeader = el('div', { className: 'sw-section-header' }, el('span', { text: 'Reactions:' }));
  const reactionButtons = el('div', { className: 'sw-button-row' });
  const addReactionBtn = el('button', { text: '+' });
  const removeReactionBtn = el('button', { text: '-' });
  const reactionUpBtn = el('button', { text: '↑' });
  const reactionDownBtn = el('button', { text: '↓' });
  const reactionScriptBtn = el('button', { text: 'Script' });
  reactionButtons.append(addReactionBtn, removeReactionBtn, reactionUpBtn, reactionDownBtn, reactionScriptBtn);

  const reactionList = el('select', { attrs: { size: '6' }, className: 'sw-listbox' }) as HTMLSelectElement;
  if (selectedOption) {
    for (const rxn of selectedOption.reactions) {
      const rxnNode = el('option', { text: rxn.text || '(Reaction)', attrs: { value: rxn.id } }) as HTMLOptionElement;
      if (rxn.id === state.selections.reactionId) {
        rxnNode.selected = true;
      }
      reactionList.appendChild(rxnNode);
    }
  }
  reactionList.addEventListener('change', () => store.selectReaction(reactionList.value || null));

  const reactionText = el('textarea', { attrs: { rows: '3' }, className: 'sw-textarea' }) as HTMLTextAreaElement;
  reactionText.value = selectedReaction?.text ?? '';
  reactionText.addEventListener('input', () => {
    const reaction = getSelectedReaction(store.getState());
    if (!reaction) return;
    reaction.text = reactionText.value;
    const selectedIndex = reactionList.selectedIndex;
    if (selectedIndex >= 0) {
      reactionList.options[selectedIndex].text = reaction.text || '(Reaction)';
    }
    touchStoryworld(storyworld);
  });

  const weightRow = el('div', { className: 'sw-weight-row' });
  const weightSlider = el('input', { attrs: { type: 'range', min: '0', max: '1', step: '0.01' } }) as HTMLInputElement;
  const weightInput = el('input', { attrs: { type: 'number', min: '0', max: '1', step: '0.01' } }) as HTMLInputElement;
  weightSlider.value = String(selectedReaction?.weight ?? 1);
  weightInput.value = String(selectedReaction?.weight ?? 1);
  const updateWeight = (value: string) => {
    const reaction = getSelectedReaction(store.getState());
    if (!reaction) return;
    const numeric = Math.min(1, Math.max(0, Number(value)));
    reaction.weight = numeric;
    weightSlider.value = String(numeric);
    weightInput.value = String(numeric);
    touchStoryworld(storyworld);
  };
  weightSlider.addEventListener('input', () => updateWeight(weightSlider.value));
  weightInput.addEventListener('input', () => updateWeight(weightInput.value));
  weightRow.append(el('label', { text: 'Weight' }), weightSlider, weightInput);

  reactionScriptBtn.addEventListener('click', () => {
    const reaction = getSelectedReaction(store.getState());
    if (!reaction) return;
    openScriptModal({
      storyworld,
      initialScript: reaction.desirability_script ?? null,
      onConfirm: (script) => {
        reaction.desirability_script = script;
        touchStoryworld(storyworld);
      },
    });
  });

  addReactionBtn.addEventListener('click', () => {
    const option = getSelectedOption(store.getState());
    if (!option) return;
    const reaction = new Reaction('New reaction', `rxn_${UUID.v4()}`);
    reaction.parent_option = option;
    option.reactions.push(reaction);
    touchStoryworld(storyworld);
    store.selectReaction(reaction.id);
  });
  removeReactionBtn.addEventListener('click', () => {
    const option = getSelectedOption(store.getState());
    const reaction = getSelectedReaction(store.getState());
    if (!option || !reaction) return;
    option.reactions = option.reactions.filter((entry) => entry !== reaction);
    touchStoryworld(storyworld);
    store.selectReaction(null);
  });
  reactionUpBtn.addEventListener('click', () => {
    const option = getSelectedOption(store.getState());
    const reaction = getSelectedReaction(store.getState());
    if (!option || !reaction) return;
    const index = option.reactions.indexOf(reaction);
    moveItem(option.reactions, index, index - 1);
    touchStoryworld(storyworld);
    store.selectReaction(reaction.id);
  });
  reactionDownBtn.addEventListener('click', () => {
    const option = getSelectedOption(store.getState());
    const reaction = getSelectedReaction(store.getState());
    if (!option || !reaction) return;
    const index = option.reactions.indexOf(reaction);
    moveItem(option.reactions, index, index + 1);
    touchStoryworld(storyworld);
    store.selectReaction(reaction.id);
  });

  const effectsHeader = el('div', { className: 'sw-section-header' }, el('span', { text: 'Reaction effects:' }));
  const effectsButtons = el('div', { className: 'sw-button-row' });
  const addEffectBtn = el('button', { text: '+' });
  const removeEffectBtn = el('button', { text: '-' });
  const effectUpBtn = el('button', { text: '↑' });
  const effectDownBtn = el('button', { text: '↓' });
  effectsButtons.append(addEffectBtn, removeEffectBtn, effectUpBtn, effectDownBtn);

  const effectsList = el('select', { attrs: { size: '5' }, className: 'sw-listbox' }) as HTMLSelectElement;
  const effects = selectedReaction?.after_effects ?? [];
  effects.forEach((effect, index) => {
    const option = el('option', { text: formatEffect(effect), attrs: { value: String(index) } }) as HTMLOptionElement;
    effectsList.appendChild(option);
  });

  addEffectBtn.addEventListener('click', () => {
    const reaction = getSelectedReaction(store.getState());
    if (!reaction) return;
    reaction.after_effects.push(new NudgeOperator(new BNumberConstant(0), new BNumberConstant(0)));
    touchStoryworld(storyworld);
    store.setState({ storyworld });
  });
  removeEffectBtn.addEventListener('click', () => {
    const reaction = getSelectedReaction(store.getState());
    if (!reaction) return;
    const index = effectsList.selectedIndex;
    if (index < 0) return;
    reaction.after_effects.splice(index, 1);
    touchStoryworld(storyworld);
    store.setState({ storyworld });
  });
  effectUpBtn.addEventListener('click', () => {
    const reaction = getSelectedReaction(store.getState());
    if (!reaction) return;
    const index = effectsList.selectedIndex;
    moveItem(reaction.after_effects, index, index - 1);
    touchStoryworld(storyworld);
    store.setState({ storyworld });
  });
  effectDownBtn.addEventListener('click', () => {
    const reaction = getSelectedReaction(store.getState());
    if (!reaction) return;
    const index = effectsList.selectedIndex;
    moveItem(reaction.after_effects, index, index + 1);
    touchStoryworld(storyworld);
    store.setState({ storyworld });
  });

  rightCol.append(reactionsHeader, reactionButtons, reactionList, reactionText, weightRow, effectsHeader, effectsButtons, effectsList);

  container.append(leftCol, centerCol, rightCol);
  return container;
}
