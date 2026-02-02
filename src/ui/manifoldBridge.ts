import { Storyworld } from '../Storyworld';
import { StoryworldSerializer } from '../StoryworldSerializer';

let manifoldWindow: Window | null = null;
let lastPayload: string | null = null;
let lastData: unknown | null = null;
let sendTimer: number | null = null;

const manifoldUrl = '/manifold.html';

const postToManifold = (data: unknown) => {
  if (!manifoldWindow || manifoldWindow.closed) return;
  manifoldWindow.postMessage({ type: 'storyworld:update', data }, '*');
};

export const openManifoldWindow = (): Window | null => {
  if (!manifoldWindow || manifoldWindow.closed) {
    manifoldWindow = window.open(manifoldUrl, 'sweepweave-manifold', 'width=1200,height=900');
  }
  if (manifoldWindow) {
    manifoldWindow.focus();
  }
  return manifoldWindow;
};

export const sendStoryworldToManifold = (storyworld: Storyworld) => {
  if (!manifoldWindow || manifoldWindow.closed) return;
  const data = StoryworldSerializer.to_project_dict(storyworld);
  lastData = data;
  const payload = JSON.stringify(data);
  if (payload === lastPayload) return;
  lastPayload = payload;
  if (sendTimer) window.clearTimeout(sendTimer);
  sendTimer = window.setTimeout(() => {
    postToManifold(data);
  }, 200);
};

export const attachManifoldListener = (onSelectEncounter: (id: string) => void) => {
  window.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'manifold:selectEncounter') {
      if (typeof event.data.id === 'string') {
        onSelectEncounter(event.data.id);
      }
      return;
    }
    if (event.data.type === 'manifold:ready' && lastData) {
      postToManifold(lastData);
    }
  });
};
