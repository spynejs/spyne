const replace = require('@rollup/plugin-replace');
const dotenv = require('dotenv');

dotenv.config();

const isCI = Boolean(
    process.env.GITHUB_ACTIONS ||
    process.env.TRAVIS ||
    process.env.CI
);

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],

    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-rollup-preprocessor'
    ],

    files: [
      { pattern: './node_modules/ramda/dist/ramda.min.js', watched: false },
      { pattern: './node_modules/rxjs/**/*.js', included: false, watched: false },

      { pattern: './src/tests/index.test.js', watched: true },
      { pattern: './src/tests/spyne-app.test.js', watched: true },
      { pattern: './src/tests/package-json.spec.test.js', watched: true },
      { pattern: './src/tests/channels/*.test.js', watched: true },
      { pattern: './src/tests/utils/*.test.js', watched: true },
      { pattern: './src/tests/views/*.test.js', watched: true }
    ],

    preprocessors: {
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
          'process.env.IS_PUBLIC': JSON.stringify(process.env.IS_PUBLIC === 'true'),
          preventAssignment: true
        }),

        require('@rollup/plugin-node-resolve').default({
          browser: true
        }),

        require('@rollup/plugin-commonjs')({
          transformMixedEsModules: true
        }),

        require('@rollup/plugin-json')()
      ]
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--remote-debugging-port=9222'
        ]
      }
    },

    browsers: [isCI ? 'ChromeHeadlessNoSandbox' : 'Chrome'],

    singleRun: true,

    autoWatch: false,

    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 2,

    reporters: ['progress']
  });
};
