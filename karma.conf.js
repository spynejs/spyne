const webpackConfigs = require('./webpack.config');

// Since webpack.config.js exports an array [esmConfig, umdConfig],
// we'll grab the second one (UMD) to use in Karma.
const [esmConfig, umdConfig] = webpackConfigs || [];

// Make a shallow clone of the UMD config so we can tweak it for Karma:
const karmaWebpackConfig = {
  ...umdConfig,

  // Force a "neutral" mode so Webpack doesn't minify or do env-specific optimizations
  mode: 'none',

  // Karma manages watching/rebuilding on its own, so we typically disable watch from Webpack
  watch: false,

  // Remove the library entry/output so that Karma can inline test files
  entry: undefined,
  output: undefined
};
karmaWebpackConfig.externals = [];
// Optionally inject any test-specific loaders/rules, e.g. coverage instrumentation:
karmaWebpackConfig.module.rules.push({
  test: /\.js$/,
  exclude: /node_modules/,
  // If you use Babel or another coverage tool, you can add it here
  // For example:
  // use: {
  //   loader: 'babel-loader',
  //   options: {
  //     plugins: ['istanbul'] // coverage plugin
  //   }
  // }
});

module.exports = function (config) {
  // If you need Travis CI logic:
  if (process.env.TRAVIS) {
    config.browsers = ['ChromeHeadlessNoSandbox'];
  }

  config.set({
    // Base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // Test frameworks
    frameworks: ['webpack', 'mocha', 'chai'],

    plugins: [
      'karma-webpack',
      'karma-mocha',
      'karma-chai',
      'karma-coverage',
      'karma-chrome-launcher'
    ],

    // List of files / patterns to load in the browser
    files: [
      // External deps you might need:
      { pattern: './node_modules/ramda/dist/ramda.min.js', watched: false },
      { pattern: './node_modules/rxjs/**/*.js', included: false, watched: false },

      // Your test files:
      { pattern: './src/tests/index.test.js', watched: true },
      { pattern: './src/tests/spyne-app.test.js', watched: true },
      { pattern: './src/tests/package-json.spec.test.js', watched: true },
      { pattern: './src/tests/spyne-plugin.test.js', watched: true },
      { pattern: './src/tests/channels/*.test.js', watched: true },
      { pattern: './src/tests/utils/*.test.js', watched: true },
      { pattern: './src/tests/views/*.test.js', watched: true }
    ],

    // Preprocessors so that the files are processed by Webpack + coverage
    preprocessors: {
      './src/tests/*.test.js': ['webpack', 'coverage'],
      './src/tests/channels/*.test.js': ['webpack', 'coverage'],
      './src/tests/utils/*.test.js': ['webpack', 'coverage'],
      './src/tests/views/*.test.js': ['webpack', 'coverage']
    },

    // Use our customized Webpack config
    webpack: karmaWebpackConfig,

    // Quiet the Webpack output in the Karma logs
    webpackMiddleware: { noInfo: true },

    // Report results with coverage
    reporters: ['coverage'],

    coverageReporter: {
      reporters: [
        { type: 'lcovonly', subdir: '.' }, // ./coverage/lcov.info
        { type: 'json', subdir: '.' }      // ./coverage/coverage-final.json
      ]
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,

    // autoWatch: if true, re-run tests on file changes
    autoWatch: true,

    // For file-watching inside containers or certain OS environments
    usePolling: true,

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },

    // Browsers to start (choose your launcher)
    browsers: ['Chrome'],

    // If true, Karma runs tests once and exits
    singleRun: true,

    // Concurrency level
    concurrency: Infinity
  });
};
