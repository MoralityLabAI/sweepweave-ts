import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("ai", {
  runCodex: (payload) => ipcRenderer.invoke("codex:run", payload),
  getDefaultCwd: () => ipcRenderer.invoke("codex:default-cwd"),
  onData: (handler) => {
    ipcRenderer.on("codex:data", (_evt, data) => handler(data));
  },
  onDone: (handler) => {
    ipcRenderer.on("codex:done", (_evt, data) => handler(data));
  },
  onError: (handler) => {
    ipcRenderer.on("codex:error", (_evt, data) => handler(data));
  },
});

