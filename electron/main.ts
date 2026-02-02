import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { spawn } from 'child_process';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
  }
};

app.whenReady().then(() => {
  ipcMain.handle('codex:run', (event, payload: { prompt: string; cwd?: string; codexPath?: string }) => {
    const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const codexPath = payload.codexPath?.trim() || 'codex';
    const args = ['--yolo', payload.prompt];
    const child = spawn(codexPath, args, {
      cwd: payload.cwd || process.cwd(),
      env: process.env,
      shell: true,
    });

    child.stdout.on('data', (chunk) => {
      event.sender.send('codex:data', { runId, stream: 'stdout', data: chunk.toString() });
    });
    child.stderr.on('data', (chunk) => {
      event.sender.send('codex:data', { runId, stream: 'stderr', data: chunk.toString() });
    });
    child.on('close', (code) => {
      event.sender.send('codex:done', { runId, code });
    });
    child.on('error', (error) => {
      event.sender.send('codex:error', { runId, message: error.message });
    });

    return runId;
  });

  createWindow();
});
