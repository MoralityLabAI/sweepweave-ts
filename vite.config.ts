import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  optimizeDeps: {
    exclude: ['html-encoding-sniffer', '@exodus/bytes'],
  },
  ssr: {
    noExternal: ['html-encoding-sniffer', '@exodus/bytes'],
  },
});
