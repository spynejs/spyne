// Karma configuration
// Generated on Fri Mar 31 2017 02:40:49 GMT-0400 (EDT)
const webpackEnv = {test:true};
//const webpackConfig = require("./webpack.config")(webpackEnv);
const webpackConfig = require("./webpack.config");
webpackConfig.mode = 'development';
const fileGlob =  './src/tests/index.test.js';
process.env.BABEL_ENV = 'test';



module.exports = function(config) {

  if (process.env.TRAVIS) {
    config.browsers = ['Chrome_travis_ci'];
  }

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [

        {pattern: './node_modules/ramda/dist/ramda.min.js', watched:false},
        {pattern: './node_modules/rxjs/bundles/Rx.js', watched:false},


	    {pattern: './src/tests/*.test.js', watched: true},
	    {pattern: './src/tests/channels/!*.test.js', watched: true},
	    {pattern: './src/tests/utils/!*.test.js', watched: true},
	    {pattern: './src/tests/views/!*.test.js', watched: true}
    ],




    // list of files to exclude
    exclude: [

    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
	    './src/tests/*.test.js' : ['webpack', 'coverage'],
	    './src/tests/channels/!*.test.js' : ['webpack', 'coverage'],
	    './src/tests/utils/!*.test.js' : ['webpack', 'coverage'],
	    './src/tests/views/!*.test.js' : ['webpack', 'coverage']
    },

    webpack: webpackConfig,

    webpackMiddleware: {noInfo: true},


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['coverage'],

/*
    coverageReporter: {
      reporters: [
          {type: 'lcov', dir: 'coverage/', subdir: '.'},
          {type: 'text-summary'}


      ]
    },
*/


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
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,



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
