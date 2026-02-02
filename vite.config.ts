import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    transformMode: {
      web: [/.(ts|tsx)$/, /html-encoding-sniffer/, /@exodus\/bytes/],
    },
  },
});
