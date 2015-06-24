'use strict'

var path = require('path')
var webpackConfig = require('./webpack.config')
var merge = require('lodash/object/merge')

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'test/support/*.js',
      'test/**/*.js*'
    ],

    // list of files to exclude
    exclude: [
    ],

    preprocessors: {
      'test/**/*.js*': ['webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map',
      watchDelay: 3000,
      resolve: merge(webpackConfig.resolve, {
        alias: {
          fixtures: path.join(__dirname, 'test', 'fixtures')
        }
      }),
      module: webpackConfig.module
    },

    webpackMiddleware: {
      noInfo: true
    },


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'osx', 'coverage', 'sl_ie8/9/10...'
    // CLI --reporters progress
    reporters: ['osx', 'dots', 'coverage'],

    coverageReporter: {
      subdir: function(browser) {
        return browser.split(/[ /-]/)[0]
      },
      reporters: [
        { type: 'html', dir: 'coverage/' },
        { type: 'text-summary' }
      ]
    },

    junitReporter: {
      outputFile: (process.env.CIRCLE_TEST_REPORTS || '.') + '/karma/' + (process.env.BROWSER || 'karma') + '.xml'
    },


    // web server port
    // CLI --port 9876
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    // CLI --colors --no-colors
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // CLI --log-level debug
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: true,
    autoWatchBatchDelay: 2000,

    // Start these browsers
    // CLI --browsers Chrome,Firefox,Safari
    browsers: ['PhantomJS'],

    // global config of your SauceLabs account
    sauceLabs: {
      testName: 'turbine'
    },

    // define SL browsers
    // make sure you have SAUCE_USERNAME and SAUCE_ACCESS_KEY set
    customLaunchers: {
      sl_ie8: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '8'
      },
      sl_ie9: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '9'
      },
      sl_ie10: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '10'
      },
      sl_ie11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: '11'
      }
    },

    // If browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 40 * 1000,

    // How long does Karma wait for a message from a browser before disconnecting it
    browserNoActivityTimeout: 20 * 1000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    // CLI --single-run --no-single-run
    singleRun: false,

    // report which specs are slower than 500ms
    // CLI --report-slower-than 500
    reportSlowerThan: 500
  })
}
