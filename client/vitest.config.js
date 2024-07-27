import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './client/test/setup.js',
    transformMode: {
      web: [/\.jsx$/], 
    },
  },
});
