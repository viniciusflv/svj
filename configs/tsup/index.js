const path = require('path');
const { defineConfig } = require('tsup');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

/**
 * @param {Parameters<typeof defineConfig>[0] & { injectReact?: boolean }} options
 * @returns {void}
 */
module.exports = ({ entry = ['src/index.ts'], injectReact, ...options } = {}) =>
  defineConfig({
    entry,
    platform: 'node',
    format: ['cjs', 'esm'],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    esbuildPlugins: [nodeExternalsPlugin()],
    inject: injectReact && [path.resolve(__dirname, 'inject.js')],
    ...options,
  });
