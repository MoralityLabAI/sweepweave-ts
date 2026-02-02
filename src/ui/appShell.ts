import { el, clear } from './dom';
import { Store, TabKey } from './store';
import { renderOverviewTab } from './tabs/overview';
import { renderEncountersTab } from './tabs/encounters';
import { renderSpoolsTab } from './tabs/spools';
import { renderCharactersTab } from './tabs/characters';
import { renderPersonalityTab } from './tabs/personality';
import { renderPlayTab } from './tabs/play';
import { renderAIConsoleTab } from './tabs/aiConsole';
import { StoryworldIO } from '../StoryworldIO';
import { StoryworldSerializer } from '../StoryworldSerializer';

const tabs: TabKey[] = [
  'Overview',
  'Encounters',
  'Spools',
  'Characters',
  'Personality Model',
  'Settings',
  'Documentation',
  'Graph View',
  'Play',
  'Rehearsal',
  'AI Console',
];

function renderTabContent(store: Store): HTMLElement {
  const state = store.getState();
  switch (state.activeTab) {
    case 'Overview':
      return renderOverviewTab(store);
    case 'Encounters':
      return renderEncountersTab(store);
    case 'Spools':
      return renderSpoolsTab(store);
    case 'Characters':
      return renderCharactersTab(store);
    case 'Personality Model':
      return renderPersonalityTab(store);
    case 'Play':
      return renderPlayTab(store);
    case 'AI Console':
      return renderAIConsoleTab(store);
    default:
      return el('div', { className: 'sw-placeholder', text: `${state.activeTab} coming soon.` });
  }
}

export function createAppShell(store: Store): HTMLElement {
  const root = el('div', { className: 'sw-app' });
  const menuRow = el('div', { className: 'sw-menu-row' });
  const menuGroup = el('div', { className: 'sw-menu-group' });

  const fileButton = el('button', { className: 'sw-menu-button', text: 'File' });
  const viewButton = el('button', { className: 'sw-menu-button', text: 'View' });
  const helpButton = el('button', { className: 'sw-menu-button', text: 'Help' });
  const aiButton = el('button', { className: 'sw-menu-button', text: 'AI' });

  const fileMenu = el('div', { className: 'sw-menu-dropdown' });
  const loadButton = el('button', { className: 'sw-menu-item', text: 'Load JSON' });
  const saveButton = el('button', { className: 'sw-menu-item', text: 'Save JSON' });
  fileMenu.append(loadButton, saveButton);

  const aiMenu = el('div', { className: 'sw-menu-dropdown' });
  const aiConsoleButton = el('button', { className: 'sw-menu-item', text: 'AI Console' });
  aiMenu.append(aiConsoleButton);

  const fileInput = el('input', {
    attrs: { type: 'file', accept: '.json,.js' },
  }) as HTMLInputElement;
  fileInput.className = 'sw-hidden';

  fileButton.addEventListener('click', () => {
    fileMenu.classList.toggle('open');
    aiMenu.classList.remove('open');
  });

  aiButton.addEventListener('click', () => {
    aiMenu.classList.toggle('open');
    fileMenu.classList.remove('open');
  });

  aiConsoleButton.addEventListener('click', () => {
    aiMenu.classList.remove('open');
    store.setState({ activeTab: 'AI Console' });
  });

  loadButton.addEventListener('click', () => {
    fileMenu.classList.remove('open');
    fileInput.value = '';
    fileInput.click();
  });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const text = await file.text();
    const storyworld = store.getState().storyworld;
    const ok = StoryworldIO.load_into_storyworld(storyworld, text);
    if (ok) {
      store.setState({
        storyworld,
        selections: {
          encounterId: null,
          optionId: null,
          reactionId: null,
          spoolId: null,
          characterId: null,
          propertyId: null,
        },
      });
    }
  });

  saveButton.addEventListener('click', () => {
    fileMenu.classList.remove('open');
    const storyworld = store.getState().storyworld;
    const data = StoryworldSerializer.to_project_dict(storyworld);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${storyworld.storyworld_title || 'storyworld'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  menuGroup.append(fileButton, viewButton, helpButton, aiButton);
  menuRow.append(menuGroup, fileMenu, aiMenu, fileInput);

  const tabRow = el('div', { className: 'sw-tab-row' });
  const content = el('div', { className: 'sw-content' });

  const renderTabs = () => {
    clear(tabRow);
    const state = store.getState();
    for (const tab of tabs) {
      const tabButton = el('button', {
        className: tab === state.activeTab ? 'sw-tab active' : 'sw-tab',
        text: tab,
      });
      tabButton.addEventListener('click', () => store.setState({ activeTab: tab }));
      tabRow.appendChild(tabButton);
    }
  };

  const renderContent = () => {
    clear(content);
    content.appendChild(renderTabContent(store));
  };

  store.subscribe(() => {
    renderTabs();
    renderContent();
  });

  renderTabs();
  renderContent();

  root.append(menuRow, tabRow, content);
  return root;
}
