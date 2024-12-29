const replace = require('@rollup/plugin-replace');
const dotenv = require('dotenv');
dotenv.config();

module.exports = function (config) {
  // ...
  // Use process.env.IS_PUBLIC as needed
  // ...
};

module.exports = function (config) {

  if (process.env.TRAVIS) {
    config.browsers = ['ChromeHeadlessNoSandbox'];
  }

  config.set({
    frameworks: ['mocha', 'chai'],

    // Load these plugins so Karma recognizes 'rollup' as a preprocessor
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-rollup-preprocessor'
    ],

    files: [
      // Test files
      { pattern: './node_modules/ramda/dist/ramda.min.js', watched: false },
      { pattern: './node_modules/rxjs/**/*.js', included: false, watched: false },

      // Your test files:
      { pattern: './src/tests/index.test.js', watched: true },
      { pattern: './src/tests/spyne-app.test.js', watched: true },
      { pattern: './src/tests/package-json.spec.test.js', watched: true },
      { pattern: './src/tests/channels/*.test.js', watched: true },
      { pattern: './src/tests/utils/*.test.js', watched: true },
      { pattern: './src/tests/views/*.test.js', watched: true }    ],

    preprocessors: {
      // We want to run Rollup on our test files (and any imports they pull in)
      './src/tests/*.test.js': ['rollup'],
      './src/tests/channels/*.test.js': ['rollup'],
      './src/tests/utils/*.test.js': ['rollup'],
      './src/tests/views/*.test.js': ['rollup']
    },

    rollupPreprocessor: {
      output: {
        format: 'iife',
        name: 'SpyneTest',
        sourcemap: 'inline'
      },
      plugins: [
        replace({
          // The replacement you want to do:
          'process.env.IS_PUBLIC': JSON.stringify(process.env.IS_PUBLIC === 'true'),
          // Or if you'd rather fallback to 'false' if not set:
          // 'process.env.IS_PUBLIC': JSON.stringify(process.env.IS_PUBLIC ?? 'false'),

          preventAssignment: true
        }),

        require('@rollup/plugin-node-resolve').default(),
        require('@rollup/plugin-commonjs')({
          transformMixedEsModules: true
        }),
        require('@rollup/plugin-json')()
      ]
    },

    // Browsers
    browsers: ['Chrome'],

    // run once and exit or watch
    singleRun: true
  });
};
