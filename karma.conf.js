
const webpackConfig = require("./webpack.config");
webpackConfig.mode = 'none';
webpackConfig.watch = true;
webpackConfig.entry = undefined;
webpackConfig.output = undefined;

const fileGlob =  './src/tests/index.test.js';


module.exports = function(config) {

  if (process.env.TRAVIS) {
    config.browsers = ['Chrome_travis_ci'];
  }


  webpackConfig.module.rules.push(
      {
       test: /(\.js)$/,
       exclude: /(node_modules)/
       }
  );


  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    output:{

    },

    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['webpack', 'mocha', 'chai'],

    plugins: [
      'karma-webpack',
      'karma-mocha',
      'karma-chai',
      'karma-coverage',
      'karma-chrome-launcher'
    ],


    files: [
      {pattern: './node_modules/ramda/dist/ramda.min.js', watched:false},
      { pattern: './node_modules/rxjs/**/*.js', included:false,    watched: false },

      {pattern: './src/tests/index.test.js', watched: true},
      {pattern: './src/tests/spyne-app.test.js', watched: true},
      {pattern: './src/tests/spyne-plugin.test.js', watched: true},
      {pattern: './src/tests/channels/*.test.js', watched: true},

      {pattern: './src/tests/utils/*.test.js', watched: true},
      {pattern: './src/tests/views/*.test.js', watched: true}
    ],


    exclude: [

    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
     './src/tests/*.test.js' : ['webpack', 'coverage'],
      './src/tests/channels/*.test.js' : ['webpack', 'coverage'],
      './src/tests/utils/*.test.js' : ['webpack', 'coverage'],
      './src/tests/views/*.test.js' : ['webpack', 'coverage']
    },

    webpack: webpackConfig,

    webpackMiddleware: {noInfo: true},


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['coverage'],

    coverageReporter: {
      reporters: [
        // generates ./coverage/lcov.info
        {type:'lcovonly', subdir: '.'},
        // generates ./coverage/coverage-final.json
        {type:'json', subdir: '.'},
      ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,
    usePolling: true,

    customLaunchers: {
       ChromeHeadlessNoSandbox: {
       base: 'ChromeHeadless',
       flags: ['--no-sandbox']
     }

    },


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
