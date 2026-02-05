import { el } from '../dom';

interface SelectCastMembersOptions {
  title?: string;
  castMembers: { id: string; name: string }[];
  onConfirm: (selectedIds: string[]) => void;
  onCancel?: () => void;
}

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

export function openSelectCastMembersModal(options: SelectCastMembersOptions): void {
  const overlay = el('div', { className: 'sw-modal-overlay' });
  const modal = el('div', { className: 'sw-modal sw-modal-narrow' });
  const header = el('div', { className: 'sw-modal-header', text: options.title ?? 'Select Cast Members' });
  const body = el('div', { className: 'sw-modal-body sw-modal-body-single' });
  const pane = el('div', { className: 'sw-modal-pane sw-form' });
  const footer = el('div', { className: 'sw-modal-footer' });
  const okButton = el('button', { text: 'OK' });
  const cancelButton = el('button', { text: 'Cancel' });

  const validation = el('div', { className: 'sw-validation', text: '' });
  const list = el('div', { className: 'sw-checkbox-list' });
  const selections = new Set<string>();

  for (const member of options.castMembers) {
    const checkbox = el('input', { attrs: { type: 'checkbox' } }) as HTMLInputElement;
    const label = el('label', { text: member.name || member.id });
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selections.add(member.id);
      } else {
        selections.delete(member.id);
      }
    });
    const row = el('div', { className: 'sw-checkbox-row' }, checkbox, label);
    list.appendChild(row);
  }

  pane.append(
    el('label', { text: 'Cast Members' }),
    list,
    validation
  );

  const close = () => {
    cleanup();
    document.body.removeChild(overlay);
  };

  const onCancel = () => {
    options.onCancel?.();
    close();
  };

  okButton.addEventListener('click', () => {
    if (selections.size === 0) {
      validation.textContent = 'Select at least one cast member.';
      return;
    }
    options.onConfirm([...selections]);
    close();
  });
  cancelButton.addEventListener('click', onCancel);

  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  });

  footer.append(okButton, cancelButton);
  body.append(pane);
  modal.append(header, body, footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const cleanup = trapFocus(modal);
}
