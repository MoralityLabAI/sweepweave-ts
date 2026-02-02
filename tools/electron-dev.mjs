import { spawn } from 'child_process';
import http from 'http';
import https from 'https';

const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

const ping = (url) =>
  new Promise((resolve) => {
    const target = new URL(url);
    const lib = target.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        method: 'GET',
        hostname: target.hostname,
        port: target.port,
        path: target.pathname,
      },
      (res) => {
        res.resume();
        resolve(res.statusCode && res.statusCode < 500);
      }
    );
    req.on('error', () => resolve(false));
    req.end();
  });

const waitForServer = async (url, retries = 120) => {
  for (let i = 0; i < retries; i += 1) {
    const ok = await ping(url);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
};

const vite = spawn('vite', ['--host'], {
  stdio: 'inherit',
  shell: true,
});

const shutdown = () => {
  if (!vite.killed) {
    vite.kill();
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const ready = await waitForServer(devServerUrl);
if (!ready) {
  console.error(`Vite dev server did not start at ${devServerUrl}`);
  shutdown();
  process.exit(1);
}

const electron = spawn('electron', ['-r', 'tsx/register', 'electron/main.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, VITE_DEV_SERVER_URL: devServerUrl },
});

electron.on('exit', (code) => {
  shutdown();
  process.exit(code ?? 0);
});
