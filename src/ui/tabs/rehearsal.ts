import { el, clear } from '../dom';
import { Store } from '../store';
import { Rehearsal } from '../../Rehearsal';
import { HB_Record } from '../../HB_Record';
import { Encounter } from '../../Encounter';

type RehearsalTab = 'events' | 'cast' | 'outcomes';

interface RehearsalUIState {
  rehearsal: Rehearsal | null;
  intervalId: number | null;
  speedMs: number;
  activeTab: RehearsalTab;
  expanded: boolean;
}

const uiState: RehearsalUIState = {
  rehearsal: null,
  intervalId: null,
  speedMs: 1000,
  activeTab: 'events',
  expanded: false,
};

const formatEncounter = (encounter: Encounter | null): string => {
  if (!encounter) return '[None]';
  return encounter.title || encounter.id || '[Untitled Encounter]';
};

const collectPaths = (root: any): { path: HB_Record[] }[] => {
  const results: { path: HB_Record[] }[] = [];
  if (!root) return results;

  const dfs = (node: any, path: HB_Record[]) => {
    const record: HB_Record = node.get_metadata(0);
    const nextPath = [...path, record];
    const children = node.get_children();
    if (!children || children.length === 0) {
      results.push({ path: nextPath });
      return;
    }
    for (const child of children) {
      dfs(child, nextPath);
    }
  };

  dfs(root, []);
  return results;
};

const summarizePath = (records: HB_Record[]): string => {
  const events = records
    .map((record) => record.encounter)
    .filter((encounter): encounter is Encounter => Boolean(encounter))
    .map((encounter) => encounter.title || encounter.id || '[Encounter]');
  if (!events.length) return 'Start';
  return events.join(' -> ');
};

const computeEventIndex = (rehearsal: Rehearsal) => {
  const encounterMap = new Map<string, Encounter>();
  rehearsal.storyworld.encounters.forEach((encounter) => {
    encounterMap.set(encounter.id, encounter);
  });

  const pathCounts = new Map<string, number>();
  const reachable = new Map<string, boolean>();
  const pathSamples = new Map<string, string[]>();

  const paths = collectPaths(rehearsal.history.root);
  for (const { path } of paths) {
    const unique = new Set<string>();
    path.forEach((record) => {
      const encounter = record.encounter;
      if (!encounter) return;
      reachable.set(encounter.id, true);
      unique.add(encounter.id);
    });
    unique.forEach((id) => {
      pathCounts.set(id, (pathCounts.get(id) ?? 0) + 1);
      const list = pathSamples.get(id) ?? [];
      if (list.length < 3) {
        list.push(summarizePath(path));
      }
      pathSamples.set(id, list);
    });
  }

  return { encounterMap, pathCounts, reachable, pathSamples };
};

const stopInterval = () => {
  if (uiState.intervalId !== null) {
    window.clearInterval(uiState.intervalId);
    uiState.intervalId = null;
  }
};

export function renderRehearsalTab(store: Store): HTMLElement {
  stopInterval();
  const storyworld = store.getState().storyworld;
  const container = el('div', { className: 'sw-panel sw-rehearsal' });

  const controls = el('div', { className: 'sw-row sw-rehearsal-toolbar' });
  const playBtn = el('button', { text: 'Play' });
  const resetBtn = el('button', { text: 'Reset' });
  const refreshBtn = el('button', { text: 'Refresh' });
  const speedInput = el('input', {
    attrs: { type: 'number', value: String(uiState.speedMs), min: '100', step: '100' },
  }) as HTMLInputElement;
  const saveBtn = el('button', { text: 'Save Report' });
  controls.append(playBtn, resetBtn, refreshBtn, el('label', { text: 'Speed' }), speedInput, saveBtn);

  const tabRow = el('div', { className: 'sw-subtabs sw-rehearsal-tabs' });
  const eventTab = el('button', { text: 'Event Index' });
  const castTab = el('button', { text: 'Cast Properties Index' });
  const outcomeTab = el('button', { text: 'Notable Outcome Index' });
  tabRow.append(eventTab, castTab, outcomeTab);

  const treeControls = el('div', { className: 'sw-row sw-rehearsal-tree-controls' });
  const collapseBtn = el('button', { text: 'Collapse All' });
  const expandBtn = el('button', { text: 'Expand All' });
  treeControls.append(collapseBtn, expandBtn);

  const panelEvents = el('div', { className: 'sw-rehearsal-panel' });
  const panelCast = el('div', { className: 'sw-rehearsal-panel', text: 'Cast properties index coming soon.' });
  const panelOutcomes = el('div', { className: 'sw-rehearsal-panel', text: 'Notable outcome index coming soon.' });

  const table = el('table', { className: 'sw-table sw-rehearsal-table' });
  const thead = el('thead', {},
    el('tr', {},
      el('th', { text: 'Event' }),
      el('th', { text: 'Reachable' }),
      el('th', { text: 'Yielding Paths' })
    )
  );
  const tbody = el('tbody');
  table.append(thead, tbody);
  panelEvents.append(table);

  container.append(controls, tabRow, treeControls, panelEvents, panelCast, panelOutcomes);

  const setActiveTab = (tab: RehearsalTab) => {
    uiState.activeTab = tab;
    eventTab.className = tab === 'events' ? 'active' : '';
    castTab.className = tab === 'cast' ? 'active' : '';
    outcomeTab.className = tab === 'outcomes' ? 'active' : '';
    panelEvents.style.display = tab === 'events' ? 'block' : 'none';
    panelCast.style.display = tab === 'cast' ? 'block' : 'none';
    panelOutcomes.style.display = tab === 'outcomes' ? 'block' : 'none';
  };

  const renderEventIndex = () => {
    clear(tbody);
    if (!uiState.rehearsal) return;
    const report = computeEventIndex(uiState.rehearsal);
    storyworld.encounters.forEach((encounter) => {
      const reachable = report.reachable.get(encounter.id) ? 'Yes' : 'No';
      const pathCount = report.pathCounts.get(encounter.id) ?? 0;
      const row = el('tr', {},
        el('td', { text: formatEncounter(encounter) }),
        el('td', { text: reachable }),
        el('td', { text: String(pathCount) })
      );
      tbody.appendChild(row);
      if (uiState.expanded) {
        const details = report.pathSamples.get(encounter.id) ?? [];
        const detailText = details.length ? details.join(' | ') : 'No paths.';
        const detailRow = el('tr', { className: 'sw-rehearsal-detail' },
          el('td', { attrs: { colSpan: '3' }, text: detailText })
        );
        tbody.appendChild(detailRow);
      }
    });
  };

  const ensureRehearsal = () => {
    uiState.rehearsal = new Rehearsal(storyworld);
    uiState.rehearsal.begin_playthrough();
  };

  const refreshReport = () => {
    ensureRehearsal();
    renderEventIndex();
  };

  const tick = () => {
    if (!uiState.rehearsal) {
      ensureRehearsal();
    }
    const done = uiState.rehearsal!.rehearse_depth_first();
    renderEventIndex();
    if (done) {
      stopInterval();
    }
  };

  playBtn.addEventListener('click', () => {
    if (uiState.intervalId) {
      stopInterval();
      playBtn.textContent = 'Play';
      return;
    }
    playBtn.textContent = 'Pause';
    uiState.intervalId = window.setInterval(tick, uiState.speedMs);
  });

  resetBtn.addEventListener('click', () => {
    stopInterval();
    playBtn.textContent = 'Play';
    if (uiState.rehearsal) {
      uiState.rehearsal.clear_history();
      uiState.rehearsal.begin_playthrough();
    }
    renderEventIndex();
  });

  refreshBtn.addEventListener('click', () => {
    stopInterval();
    playBtn.textContent = 'Play';
    refreshReport();
  });

  speedInput.addEventListener('change', () => {
    const value = Number(speedInput.value || 1000);
    uiState.speedMs = Math.max(100, value);
    if (uiState.intervalId) {
      stopInterval();
      uiState.intervalId = window.setInterval(tick, uiState.speedMs);
    }
  });

  saveBtn.addEventListener('click', () => {
    if (!uiState.rehearsal) return;
    const report = computeEventIndex(uiState.rehearsal);
    const data = {
      events: storyworld.encounters.map((encounter) => ({
        id: encounter.id,
        title: encounter.title,
        reachable: report.reachable.get(encounter.id) ?? false,
        yielding_paths: report.pathCounts.get(encounter.id) ?? 0,
        sample_paths: report.pathSamples.get(encounter.id) ?? [],
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rehearsal-report.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  collapseBtn.addEventListener('click', () => {
    uiState.expanded = false;
    renderEventIndex();
  });

  expandBtn.addEventListener('click', () => {
    uiState.expanded = true;
    renderEventIndex();
  });

  eventTab.addEventListener('click', () => setActiveTab('events'));
  castTab.addEventListener('click', () => setActiveTab('cast'));
  outcomeTab.addEventListener('click', () => setActiveTab('outcomes'));

  setActiveTab(uiState.activeTab);
  refreshReport();

  return container;
}
