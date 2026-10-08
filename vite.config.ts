/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// MyStreet.id is a static SPA. No backend proxy is configured because the
// architecture is deliberately local-first (persistence lives in the browser).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/test/setup.ts',
    css: true,
  },
});
