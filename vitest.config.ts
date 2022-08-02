/// <reference types="vitest" />
import pluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [pluginReact()],
  test: {
    globals: true,
    environment: 'node',
    include: ['./libs/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
