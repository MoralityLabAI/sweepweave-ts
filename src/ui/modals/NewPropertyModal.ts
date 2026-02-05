import { el } from '../dom';
import { Storyworld } from '../../Storyworld';
import { BNumberBlueprint, possible_attribution_targets } from '../../BNumberBlueprint';
import { UUID } from '../../UUID';
import { openSelectCastMembersModal } from './SelectCastMembersModal';

interface NewPropertyModalOptions {
  storyworld: Storyworld;
  onCreate: (property: BNumberBlueprint) => void;
}

type AttributionMode = 'all' | 'some';

function trapFocus(modal: HTMLElement): () => void {
  const focusable = Array.from(
    modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('disabled'));
  if (focusable.length > 0) {
    focusable[0].focus();
  }
  const handler = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  };
  modal.addEventListener('keydown', handler);
  return () => modal.removeEventListener('keydown', handler);
}

function buildPerceptionOnion(defaultValue: number, depth: number, castIds: string[]): any {
  let onion: any = defaultValue;
  for (let layer = 0; layer < depth; layer += 1) {
    const layerMap: Record<string, any> = {};
    for (const id of castIds) {
      if (layer === 0) {
        layerMap[id] = onion;
      } else {
        layerMap[id] = JSON.parse(JSON.stringify(onion));
      }
    }
    onion = layerMap;
  }
  return onion;
}

function applyPropertyToActors(
  storyworld: Storyworld,
  property: BNumberBlueprint,
  actorIds: string[]
): void {
  const castIds = storyworld.characters.map((c) => c.id);
  for (const actor of storyworld.characters) {
    actor.authored_property_directory.set(property.id, property);
  }
  for (const actor of storyworld.characters) {
    if (!actorIds.includes(actor.id)) continue;
    const onion = buildPerceptionOnion(property.default_value, property.depth, castIds);
    actor.bnumber_properties.set(property.id, onion);
  }
}

export function openNewPropertyModal(options: NewPropertyModalOptions): void {
  const { storyworld } = options;
  const overlay = el('div', { className: 'sw-modal-overlay' });
  const modal = el('div', { className: 'sw-modal sw-modal-narrow' });
  const header = el('div', { className: 'sw-modal-header', text: 'New Property' });
  const body = el('div', { className: 'sw-modal-body sw-modal-body-single' });
  const pane = el('div', { className: 'sw-modal-pane sw-form' });
  const footer = el('div', { className: 'sw-modal-footer' });
  const okButton = el('button', { text: 'OK' });
  const cancelButton = el('button', { text: 'Cancel' });

  let attributionMode: AttributionMode = 'all';
  let p2Enabled = false;

  const nameInput = el('input', {
    attrs: { type: 'text', value: '' },
    className: 'sw-title-input',
  }) as HTMLInputElement;
  const depthInput = el('input', {
    attrs: { type: 'number', value: '1', min: '0', step: '1' },
    className: 'sw-title-input',
  }) as HTMLInputElement;
  const defaultInput = el('input', {
    attrs: { type: 'number', value: '0', step: '1' },
    className: 'sw-title-input',
  }) as HTMLInputElement;

  const validation = el('div', { className: 'sw-validation', text: '' });
  const pvalueNote = el('div', { className: 'sw-help-text', text: 'pValues enabled for all-cast properties.' });
  const p2Checkbox = el('input', { attrs: { type: 'checkbox' } }) as HTMLInputElement;
  const p2Row = el('div', { className: 'sw-checkbox-row' }, p2Checkbox, el('label', { text: 'Enable p2 (second-order)' }));

  const applySelect = el('select', { className: 'sw-compact-select' }) as HTMLSelectElement;
  applySelect.append(
    el('option', { text: 'Apply to all cast members.', attrs: { value: 'all' } }),
    el('option', { text: 'Apply to specific cast members.', attrs: { value: 'some' } })
  );

  const syncDepth = () => {
    p2Enabled = p2Checkbox.checked;
    if (p2Enabled) {
      depthInput.value = '2';
      depthInput.setAttribute('disabled', 'true');
      return;
    }
    depthInput.removeAttribute('disabled');
    if (attributionMode === 'all' && Number(depthInput.value) < 1) {
      depthInput.value = '1';
    }
  };

  const syncAttribution = () => {
    attributionMode = applySelect.value === 'all' ? 'all' : 'some';
    if (attributionMode === 'all') {
      pvalueNote.textContent = 'pValues enabled for all-cast properties.';
      if (!p2Enabled && Number(depthInput.value) < 1) {
        depthInput.value = '1';
      }
    } else {
      pvalueNote.textContent = 'pValues optional for specific-cast properties.';
      if (!p2Enabled && Number(depthInput.value) <= 1) {
        depthInput.value = '0';
      }
    }
  };

  p2Checkbox.addEventListener('change', syncDepth);
  applySelect.addEventListener('change', syncAttribution);
  syncDepth();

  const close = () => {
    cleanup();
    document.body.removeChild(overlay);
  };

  const onCancel = () => close();

  const createProperty = (selectedIds: string[]) => {
    const name = nameInput.value.trim();
    if (!name) {
      validation.textContent = 'Property name is required.';
      return;
    }
    const depth = Number(depthInput.value);
    const defaultValue = Number(defaultInput.value);
    const prop = new BNumberBlueprint(storyworld, name, `prop_${UUID.v4()}`, depth, defaultValue);
    prop.attribution_target =
      attributionMode === 'all'
        ? possible_attribution_targets.ENTIRE_CAST
        : possible_attribution_targets.CAST_MEMBERS;
    prop.affected_characters =
      attributionMode === 'all'
        ? [...storyworld.characters]
        : storyworld.characters.filter((c) => selectedIds.includes(c.id));

    storyworld.authored_properties.push(prop);
    applyPropertyToActors(storyworld, prop, selectedIds);
    options.onCreate(prop);
  };

  const onOk = () => {
    validation.textContent = '';
    if (!nameInput.value.trim()) {
      validation.textContent = 'Property name is required.';
      return;
    }
    if (p2Enabled) {
      depthInput.value = '2';
    } else if (attributionMode === 'all' && Number(depthInput.value) < 1) {
      depthInput.value = '1';
    }
    if (attributionMode === 'all') {
      createProperty(storyworld.characters.map((c) => c.id));
      close();
      return;
    }
    openSelectCastMembersModal({
      title: 'Select Cast Members',
      castMembers: storyworld.characters.map((c) => ({ id: c.id, name: c.char_name || c.id })),
      onConfirm: (selectedIds) => {
        createProperty(selectedIds);
        close();
      },
    });
  };

  okButton.addEventListener('click', onOk);
  cancelButton.addEventListener('click', onCancel);

  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      onOk();
    }
  });

  pane.append(
    el('label', { text: 'Property Name' }),
    nameInput,
    el('label', { text: 'Depth' }),
    depthInput,
    el('label', { text: 'Default Value' }),
    defaultInput,
    el('label', { text: 'Apply To' }),
    applySelect,
    el('label', { text: 'Perception Layers' }),
    el('div', { className: 'sw-field-stack' }, pvalueNote, p2Row),
    validation
  );

  footer.append(okButton, cancelButton);
  body.append(pane);
  modal.append(header, body, footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const cleanup = trapFocus(modal);
}
