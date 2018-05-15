const path = require('path');
const webpack = require('webpack');
//const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
 const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const env = require('yargs').argv.env; // use --env with webpack 2
const libraryName = 'spyne';
let devToolValue = 'eval-source-map';
let plugins = [];
let outputFile;
let viewStreamFile = path.join(__dirname, '/src/spyne/views/view-stream.js');
let optimizeFile = path.join(__dirname, '/src/spyne/utils/optimize-class.js');
let channelStreamItemFile = path.join(__dirname, '/src/spyne/channels/channel-stream-item.js');

plugins.push( new webpack.LoaderOptionsPlugin({ options: {
      test: /(\.js)$/,
          loader: 'eslint-loader',
        exclude: [/node_modules/,/(src\/tests)/],
        options: {
      fix: true
    }
  }
}));

if (env === 'build') {
  /*plugins.push( new UglifyJsPlugin({
    sourceMap: true,
    extractComments: true,
    uglifyOptions: {
      warnings: true,
      compress: true,
      extractComments: true,
      output: {
        comments: false,
        beautify: false
      },
      toplevel: false,
      nameCache: null,
      ie8: false,
      keep_classnames: undefined,
      keep_fnames: false,
      safari10: false
    }

  }));*/
 //plugins.push(  new BundleAnalyzerPlugin());
  outputFile = libraryName + '.min.js';
  devToolValue = 'none';
} else {
  outputFile = libraryName + '.js';
}

const config = {
/*
  entry:  ["babel-polyfill",  path.join(__dirname, '/src/spyne/spyne.js')],
*/
  entry: path.join(__dirname, '/src/spyne/spyne.js'),


  devtool: '',
  output: {
    path: path.join(__dirname, '/lib'),
    filename: outputFile,
    library: 'spyne',
    libraryTarget:  'umd',
    // libraryExport: [path.join(__dirname, '/src/spyne/spyne.js'),channelStreamItemFile], //[ path.join(__dirname, '/src/spyne/spyne.js')],
    umdNamedDefine: true
  },


  externals: {
    rxjs: {
      commonjs: 'rxjs',
      commonjs2: 'rxjs',
      amd: 'rxjs',
      root: 'Rx'
    },
    ramda : {
      commonjs: 'ramda',
      commonjs2: 'ramda',
      amd: 'ramda',
      root: 'R'
    }
     },

  module: {
    rules: [
      {
        test: /(\.js)$/,
        loader: 'babel-loader',
        options: {
          "babelrc" : false,
          "presets": [
            ["@babel/preset-env", {
              "targets": {
                "ie" : 10,
                  "browsers": ["last 2 versions"]

              },
              "modules": false,
              "loose": true,
              exclude: ['babel-plugin-transform-classes']

            }]
          ]
        },
        exclude: /(node_modules)/
      }
      /*,
      {
        test: /(\.js)$/,
        loader: 'eslint-loader',
        exclude: [/node_modules/,/(src\/tests)/],
        options: {
          fix: true
        }
      }*/
    ]
  },
  resolve: {
    modules: [path.resolve('./node_modules')],
    extensions: ['.json', '.js']
  },
  plugins: plugins
};

module.exports = config;
// ports = base;
