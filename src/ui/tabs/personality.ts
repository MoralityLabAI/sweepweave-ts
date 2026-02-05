import { el } from '../dom';
import { Store, touchStoryworld, getSelectedProperty } from '../store';
import { openNewPropertyModal } from '../modals/NewPropertyModal';

export function renderPersonalityTab(store: Store): HTMLElement {
  const state = store.getState();
  const storyworld = state.storyworld;
  const selectedProperty = getSelectedProperty(state);

  const container = el('div', { className: 'sw-personality' });
  const leftCol = el('div', { className: 'sw-panel sw-col' });
  const rightCol = el('div', { className: 'sw-panel sw-col sw-col-wide' });

  const header = el('div', { className: 'sw-section-header' }, el('span', { text: 'Authored properties:' }));
  const buttons = el('div', { className: 'sw-button-row' });
  const addBtn = el('button', { text: '+' });
  const removeBtn = el('button', { text: '-' });
  buttons.append(addBtn, removeBtn);

  const list = el('select', { attrs: { size: '12' }, className: 'sw-listbox' }) as HTMLSelectElement;
  for (const prop of storyworld.authored_properties) {
    const option = el('option', { text: prop.property_name || prop.id, attrs: { value: prop.id } }) as HTMLOptionElement;
    if (prop.id === state.selections.propertyId) option.selected = true;
    list.appendChild(option);
  }
  list.addEventListener('change', () => store.selectProperty(list.value || null));

  addBtn.addEventListener('click', () => {
    openNewPropertyModal({
      storyworld,
      onCreate: (prop) => {
        touchStoryworld(storyworld);
        store.selectProperty(prop.id);
      },
    });
  });
  removeBtn.addEventListener('click', () => {
    const prop = getSelectedProperty(store.getState());
    if (!prop) return;
    storyworld.authored_properties = storyworld.authored_properties.filter((entry) => entry !== prop);
    for (const actor of storyworld.characters) {
      actor.authored_property_directory.delete(prop.id);
      actor.bnumber_properties.delete(prop.id);
    }
    touchStoryworld(storyworld);
    store.selectProperty(null);
  });

  leftCol.append(header, buttons, list);

  const nameInput = el('input', {
    attrs: { type: 'text', value: selectedProperty?.property_name ?? '' },
    className: 'sw-title-input',
  }) as HTMLInputElement;
  const depthInput = el('input', {
    attrs: { type: 'number', value: String(selectedProperty?.depth ?? 0) },
    className: 'sw-title-input',
  }) as HTMLInputElement;
  const defaultInput = el('input', {
    attrs: { type: 'number', value: String(selectedProperty?.default_value ?? 0) },
    className: 'sw-title-input',
  }) as HTMLInputElement;

  nameInput.addEventListener('input', () => {
    const prop = getSelectedProperty(store.getState());
    if (!prop) return;
    prop.property_name = nameInput.value;
    touchStoryworld(storyworld);
  });
  depthInput.addEventListener('input', () => {
    const prop = getSelectedProperty(store.getState());
    if (!prop) return;
    prop.depth = Number(depthInput.value);
    touchStoryworld(storyworld);
  });
  defaultInput.addEventListener('input', () => {
    const prop = getSelectedProperty(store.getState());
    if (!prop) return;
    prop.default_value = Number(defaultInput.value);
    touchStoryworld(storyworld);
  });

  rightCol.append(
    el('label', { text: 'Property Name' }),
    nameInput,
    el('label', { text: 'Depth' }),
    depthInput,
    el('label', { text: 'Default Value' }),
    defaultInput,
    el('label', { text: 'Perception' }),
    el('div', { className: 'sw-help-text' }, `pValues: ${selectedProperty && selectedProperty.depth >= 1 ? 'On' : 'Off'}`),
    el('div', { className: 'sw-help-text' }, `p2: ${selectedProperty && selectedProperty.depth >= 2 ? 'On' : 'Off'}`)
  );

  container.append(leftCol, rightCol);
  return container;
}
