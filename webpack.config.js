// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const pkg = require('./package.json');

// Shared base config for the UMD build:
function baseConfig(mode) {
  return {
    mode,
    devtool: mode === 'production' ? false : 'inline-source-map',
    module: {
      rules: [
        // Example if you need Babel:
        // {
        //   test: /\.js$/,
        //   exclude: /node_modules/,
        //   use: 'babel-loader'
        // }
      ]
    },
    resolve: {
      extensions: ['.js'],
      modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
    },
    plugins: [
      new ESLintPlugin({
        fix: true,
        extensions: ['js'],
        exclude: ['node_modules']
      }),
      new webpack.BannerPlugin({
        banner: `spynejs ${pkg.version}\nhttps://spynejs.org\n(c) 2017-present Frank Batista`,
        entryOnly: true
      })
    ],
    optimization: {
      // Disabling module concatenation helps avoid the “Cannot read properties of undefined” error
      // when analyzing external modules for scope hoisting:
      concatenateModules: false
    }
  };
}

////////////////////////////////////////////////
// UMD Build Only (we rely on Rollup for ESM)
////////////////////////////////////////////////
const umdConfig = {
  ...baseConfig(process.env.NODE_ENV || 'development'),

  entry: './src/spyne/spyne.js',

  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'spyne.umd.js',
    library: 'spyne',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

  ///////////////////////////////////////////////////////////
  // Externals for ramda, rxjs, dompurify, etc. in UMD build
  ///////////////////////////////////////////////////////////
  externals: {
    // Ramda
    ramda: {
      commonjs: 'ramda',
      commonjs2: 'ramda',
      amd: 'ramda',
      root: 'R'
    },

    // RxJS
    rxjs: {
      commonjs: 'rxjs',
      commonjs2: 'rxjs',
      amd: 'rxjs',
      root: 'rxjs'
    },
    'rxjs/operators': {
      commonjs: ['rxjs', 'operators'],
      commonjs2: ['rxjs', 'operators'],
      amd: 'rxjs/operators',
      root: ['rxjs', 'operators']
    },

    // DOMPurify
    dompurify: {
      commonjs: 'dompurify',
      commonjs2: 'dompurify',
      amd: 'dompurify',
      root: 'DOMPurify'
    }
  }
};

module.exports = umdConfig;
