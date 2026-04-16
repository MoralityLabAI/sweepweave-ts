# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

Sweepweave is a Vite + TypeScript renderer with Electron packaging support.

- Frontend entry: `src/main.ts`
- Global styles: `src/style.css`
- Vite config: `vite.config.ts`
- Electron runtime entry: `electron/main.mjs`
- Electron preload runtime: `electron/preload.mjs`
- Build output: `dist/`
- Package output: `release/`

The `electron/*.ts` files mirror the Electron runtime code, but the npm package entry uses `electron/main.mjs`.

## Install

Use the checked-in lockfile.

```sh
npm install
```

## Local Development

Run the Vite web app:

```sh
npm run dev
```

Vite serves the app at `http://localhost:5173` by default.

Run the Electron app in development:

```sh
npm run dev:electron
```

`tools/electron-dev.mjs` starts Vite with `--host`, waits for `VITE_DEV_SERVER_URL` or `http://localhost:5173`, then launches Electron with that URL.

## Build and Preview

Build the renderer:

```sh
npm run build
```

This runs TypeScript checking and `vite build`. Use this before deploying the hosted web app.

Preview the production build locally:

```sh
npm run preview
```

`npm run preview` serves the already-built `dist/` directory through Vite's preview server.

## Hosting the Vite App

The Vite-hosted app is static after build. Deploy the contents of `dist/` to any static host.

Recommended flow:

```sh
npm ci
npm run build
```

Then publish `dist/`.

Common host settings:

- Build command: `npm run build`
- Publish/output directory: `dist`
- Node version: use a modern Node release compatible with Vite 7
- Install command: `npm ci`

The app currently uses direct browser entry points rather than a client-side router, so a special SPA rewrite is not required for the main app. If routing is added later, configure the host to rewrite unknown routes to `/index.html`.

If hosting under a subpath, set Vite's `base` option in `vite.config.ts` or provide an equivalent build-time config before deploying. The default assumes the app is hosted at the domain root.

## Electron Packaging

Build desktop packages with:

```sh
npm run pack:win
npm run pack:linux
npm run pack:mac
```

`electron-builder` writes packages to `release/`. The packaging config includes:

- `dist/**/*`
- `electron/**/*`
- `package.json`

In packaged mode, `electron/main.mjs` loads `../dist/index.html`. Keep this path aligned with Vite's output directory.

## Tests

Run the test suite:

```sh
npm test
```

Watch mode:

```sh
npm run test:watch
```

Vitest is configured for `jsdom` in `vite.config.ts`, with setup in `vitest.setup.ts`.

## Notes for Future Agents

- Prefer `rg` for searching files and symbols.
- Do not edit generated outputs in `dist/` or `release/` unless the task is specifically about generated artifacts.
- Keep renderer changes in `src/` and Electron runtime changes in `electron/*.mjs`.
- If changing Electron TypeScript source files, check whether the corresponding `.mjs` runtime files need the same update.
- Run `npm test` and `npm run build` after behavior changes when practical.
