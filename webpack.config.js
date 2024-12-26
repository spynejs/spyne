// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const WebpackRxjsExternals = require('webpack-rxjs-externals');
const pkg = require('./package.json');

// We'll define a base config to share options:
function baseConfig(mode) {
  return {
    mode,
    devtool: mode === 'production' ? false : 'inline-source-map',
    externals: [
      WebpackRxjsExternals(),
      {
        ramda: {
          commonjs: 'ramda',
          commonjs2: 'ramda',
          amd: 'ramda',
          root: 'R'
        }
      }
    ],
    module: {
      rules: [
        // Add Babel or other loaders here if needed
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
      // Modern replacement for eslint-loader
      new ESLintPlugin({
        fix: true,
        extensions: ['js'],
        exclude: ['node_modules']
      }),
      new webpack.BannerPlugin({
        banner: `spynejs ${pkg.version}\nhttps://spynejs.org\n(c) 2017-present Frank Batista`,
        entryOnly: true
      })
    ]
  };
}

// ESM Build:
const esmConfig = {
  ...baseConfig(process.env.NODE_ENV || 'development'),

  entry: './src/spyne/spyne.js',

  // Enable module output
  experiments: {
    outputModule: true
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'spyne.esm.js',
    library: {
      type: 'module'
    }
  }
};

// UMD Build:
const umdConfig = {
  ...baseConfig(process.env.NODE_ENV || 'development'),

  entry: './src/spyne/spyne.js',

  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'spyne.umd.js',
    library: 'spyne',
    libraryTarget: 'umd',
    umdNamedDefine: true
  }
};

// Export both configs in an array
module.exports = [esmConfig, umdConfig];
