import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ai', {
  runCodex: (payload: { prompt: string; cwd?: string; codexPath?: string }) => ipcRenderer.invoke('codex:run', payload),
  getDefaultCwd: () => ipcRenderer.invoke('codex:default-cwd'),
  onData: (handler: (event: { runId: string; stream: 'stdout' | 'stderr'; data: string }) => void) => {
    ipcRenderer.on('codex:data', (_evt, data) => handler(data));
  },
  onDone: (handler: (event: { runId: string; code: number | null }) => void) => {
    ipcRenderer.on('codex:done', (_evt, data) => handler(data));
  },
  onError: (handler: (event: { runId: string; message: string }) => void) => {
    ipcRenderer.on('codex:error', (_evt, data) => handler(data));
  },
});
