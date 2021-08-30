const path = require('path');
const webpack = require('webpack');
const PACKAGE = require('./package');
const version = PACKAGE.version;
const getEnv = ()=>{
  const npmCommand = process.env.npm_lifecycle_script;
  return String(npmCommand).replace(/^(webpack.*--env)(\s)*(\w+)(.*)$/gm, "$3");
}
const env = getEnv();


const libraryName = 'spyne';
let moduleRulesArr = [];
let devToolValue = 'eval-source-map';
let outputFile;
let externalsArr =[];
const WebpackRxjsExternals = require('webpack-rxjs-externals');
const loaderOptionsPlugin = new webpack.LoaderOptionsPlugin({ options: {
    test: /(\.js)$/,
    loader: 'eslint-loader',
    exclude: [/node_modules/,/(src\/tests)/],
    options: {
      fix: true
    }
  }
});

let bannerPlugin = new webpack.BannerPlugin({
    banner: `spynejs ${version}\nhttps://sypnejs.org\n(c) 2017-present Frank Batista`,
    entryOnly:true
})

//console.log("ENVI S HERE ===========",env);


let spynePlugins = [loaderOptionsPlugin];

if (env === 'build') {
  outputFile = libraryName + '.min.js';
  devToolValue = false;
  externalsArr = [
    WebpackRxjsExternals(),
    {ramda : {
        commonjs: 'ramda',
        commonjs2: 'ramda',
        amd: 'ramda',
        root: 'R'
      }}
  ];
} else if(env === 'dev') {
  outputFile = libraryName + '.js';
   moduleRulesArr.push(
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
              "loose": true
            }]
          ]
        },
        exclude: /(node_modules)/
      }

  )
}

//console.log("CONFIG IS ",process.env.BABEL_ENV );


const config = {
  entry: path.join(__dirname, '/src/spyne/spyne.js'),
  devtool: false,



  externals: externalsArr,

  module: {
    rules: moduleRulesArr
  },
  resolve: {
    modules: [path.resolve('./node_modules')],
    extensions: ['.json', '.js']
  },
  plugins: spynePlugins
};
//console.log("ENV IS ============ ",env);

if (env!==undefined){
  config['output'] = {
    path: path.join(__dirname, '/lib'),
        filename: outputFile,
        library: 'spyne',
        libraryTarget:  'umd',
        umdNamedDefine: true
  };
}

module.exports = config;
