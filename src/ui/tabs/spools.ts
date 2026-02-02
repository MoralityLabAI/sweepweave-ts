import { el } from '../dom';
import { Store, touchStoryworld, getSelectedSpool } from '../store';
import { Spool } from '../../Spool';
import { UUID } from '../../UUID';

export function renderSpoolsTab(store: Store): HTMLElement {
  const state = store.getState();
  const storyworld = state.storyworld;
  const selectedSpool = getSelectedSpool(state);

  const container = el('div', { className: 'sw-spools' });
  const leftCol = el('div', { className: 'sw-panel sw-col' });
  const rightCol = el('div', { className: 'sw-panel sw-col sw-col-wide' });

  const spoolHeader = el('div', { className: 'sw-section-header' }, el('span', { text: 'Spools:' }));
  const spoolButtons = el('div', { className: 'sw-button-row' });
  const addSpoolBtn = el('button', { text: '+' });
  const removeSpoolBtn = el('button', { text: '-' });
  spoolButtons.append(addSpoolBtn, removeSpoolBtn);

  const spoolList = el('select', { attrs: { size: '12' }, className: 'sw-listbox' }) as HTMLSelectElement;
  for (const spool of storyworld.spools) {
    const opt = el('option', { text: spool.name || spool.id, attrs: { value: spool.id } }) as HTMLOptionElement;
    if (spool.id === state.selections.spoolId) opt.selected = true;
    spoolList.appendChild(opt);
  }
  spoolList.addEventListener('change', () => store.selectSpool(spoolList.value || null));

  addSpoolBtn.addEventListener('click', () => {
    const spool = new Spool(`spool_${UUID.v4()}`, 'New Spool');
    storyworld.spools.push(spool);
    storyworld.spool_directory.set(spool.id, spool);
    touchStoryworld(storyworld);
    store.selectSpool(spool.id);
  });
  removeSpoolBtn.addEventListener('click', () => {
    const spool = getSelectedSpool(store.getState());
    if (!spool) return;
    storyworld.spools = storyworld.spools.filter((entry) => entry !== spool);
    storyworld.spool_directory.delete(spool.id);
    touchStoryworld(storyworld);
    store.selectSpool(null);
  });

  leftCol.append(spoolHeader, spoolButtons, spoolList);

  const topRow = el('div', { className: 'sw-row' });
  const nameInput = el('input', {
    attrs: { type: 'text', value: selectedSpool?.name ?? '' },
    className: 'sw-title-input',
  }) as HTMLInputElement;
  const activeToggle = el('label', { className: 'sw-toggle' },
    el('input', { attrs: { type: 'checkbox' } }) as HTMLInputElement,
    el('span', { text: 'Active at start' })
  );
  const activeCheckbox = activeToggle.querySelector('input') as HTMLInputElement;
  activeCheckbox.checked = Boolean(selectedSpool?.active_at_start);
  const searchInput = el('input', { attrs: { type: 'text', placeholder: 'Search Encounter' } }) as HTMLInputElement;
  const sortSelect = el('select');
  sortSelect.append(
    el('option', { text: 'Alphabetical', attrs: { value: 'alphabetical' } }),
    el('option', { text: 'Created', attrs: { value: 'created' } })
  );
  const sortDirBtn = el('button', { text: 'A/Z' });
  const sortMoreBtn = el('button', { text: '⋮' });

  topRow.append(nameInput, activeToggle, searchInput, sortSelect, sortDirBtn, sortMoreBtn);

  nameInput.addEventListener('input', () => {
    const spool = getSelectedSpool(store.getState());
    if (!spool) return;
    spool.name = nameInput.value;
    touchStoryworld(storyworld);
  });
  activeCheckbox.addEventListener('change', () => {
    const spool = getSelectedSpool(store.getState());
    if (!spool) return;
    spool.active_at_start = activeCheckbox.checked;
    touchStoryworld(storyworld);
  });

  let sortAsc = true;
  sortDirBtn.addEventListener('click', () => {
    sortAsc = !sortAsc;
    sortDirBtn.textContent = sortAsc ? 'A/Z' : 'Z/A';
    store.setState({ storyworld });
  });
  sortSelect.addEventListener('change', () => store.setState({ storyworld }));

  const spoolEncountersSection = el('div', { className: 'sw-spool-body' });
  const spoolEncountersList = el('select', { attrs: { size: '10' }, className: 'sw-listbox' }) as HTMLSelectElement;
  const addEncounterBtn = el('button', { text: 'Add encounter' });
  const removeEncounterBtn = el('button', { text: 'Remove encounter' });

  if (selectedSpool) {
    const encounterIds = [...selectedSpool.encounter_ids];
    for (const encId of encounterIds) {
      const encounter = storyworld.encounter_directory.get(encId);
      if (!encounter) continue;
      spoolEncountersList.appendChild(
        el('option', { text: encounter.title || encounter.id, attrs: { value: encounter.id } }) as HTMLOptionElement
      );
    }
  }

  const allEncountersList = el('select', { attrs: { size: '10' }, className: 'sw-listbox' }) as HTMLSelectElement;
  const updateAllEncounters = () => {
    allEncountersList.innerHTML = '';
    const term = searchInput.value.toLowerCase();
    let encounters = [...storyworld.encounters];
    if (sortSelect.value === 'alphabetical') {
      encounters.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (!sortAsc) encounters.reverse();
    for (const encounter of encounters) {
      if (term && !encounter.title.toLowerCase().includes(term)) continue;
      const option = el('option', { text: encounter.title || encounter.id, attrs: { value: encounter.id } }) as HTMLOptionElement;
      allEncountersList.appendChild(option);
    }
  };
  updateAllEncounters();
  searchInput.addEventListener('input', updateAllEncounters);

  addEncounterBtn.addEventListener('click', () => {
    const spool = getSelectedSpool(store.getState());
    if (!spool) return;
    const selectedId = allEncountersList.value;
    if (!selectedId) return;
    if (!spool.encounter_ids.includes(selectedId)) {
      spool.encounter_ids.push(selectedId);
      touchStoryworld(storyworld);
      store.setState({ storyworld });
    }
  });
  removeEncounterBtn.addEventListener('click', () => {
    const spool = getSelectedSpool(store.getState());
    if (!spool) return;
    const selectedId = spoolEncountersList.value;
    if (!selectedId) return;
    spool.encounter_ids = spool.encounter_ids.filter((id) => id !== selectedId);
    touchStoryworld(storyworld);
    store.setState({ storyworld });
  });

  spoolEncountersSection.append(
    el('div', { className: 'sw-row' }, addEncounterBtn, removeEncounterBtn),
    el('div', { className: 'sw-dual-lists' }, spoolEncountersList, allEncountersList)
  );

  rightCol.append(topRow, spoolEncountersSection);

  container.append(leftCol, rightCol);
  return container;
}
