// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/spyne/spyne.js',   // Your main entry (the "barrel")
  output: {
    file: 'lib/spyne.esm.js',
    format: 'es',               // "es" = pure ESM
    sourcemap: true
  },
  // If you want to keep certain libraries external, define them here:
  external: ['ramda', 'rxjs', 'dompurify'],
  plugins: [
    // Allows Rollup to resolve packages from node_modules
    resolve(),
    // Converts CommonJS modules to ES modules
    commonjs(),
    // Allows importing JSON files
    json(),
    // Minify the output (optional)
    terser()
  ]
};
