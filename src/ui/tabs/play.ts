import { el } from '../dom';
import { Store } from '../store';

export function renderPlayTab(_store: Store): HTMLElement {
  const container = el('div', { className: 'sw-panel sw-play' });
  const controls = el('div', { className: 'sw-row' });
  const pauseBtn = el('button', { text: 'Pause' });
  const resetBtn = el('button', { text: 'Reset' });
  const refreshBtn = el('button', { text: 'Refresh' });
  const speedInput = el('input', { attrs: { type: 'number', value: '1', min: '0', step: '0.1' } }) as HTMLInputElement;
  const saveBtn = el('button', { text: 'Save Report' });
  controls.append(pauseBtn, resetBtn, refreshBtn, el('label', { text: 'Speed' }), speedInput, saveBtn);

  const tabRow = el('div', { className: 'sw-subtabs' },
    el('button', { text: 'Encounter Log' }),
    el('button', { text: 'Antagonist' }),
    el('button', { text: 'Storyworld' })
  );

  const table = el('table', { className: 'sw-table' });
  table.append(
    el('thead', {},
      el('tr', {},
        el('th', { text: 'Event' }),
        el('th', { text: 'Reachable' }),
        el('th', { text: 'Yielding Paths' })
      )
    ),
    el('tbody', {}, el('tr', {}, el('td', { text: '—' }), el('td', { text: '—' }), el('td', { text: '—' })))
  );

  container.append(controls, tabRow, table);
  return container;
}
