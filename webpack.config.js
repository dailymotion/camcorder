const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OfflinePlugin     = require('offline-plugin')
const path              = require('path')
const webpack           = require('webpack')
const sassLoaders = [
  'css-loader',
  'sass-loader?indentedSyntax=scss&includePaths[]=' + path.resolve(__dirname, './src')
]

if (!process.env.DM_API_KEY) {
  /* eslint-disable no-console */
  console.warn('⚠️  Dailymotion API key is missing! ⚠️')
  console.log('\nYour app won\'t be able to login or upload videos to Dailymotion')
  console.log('\t1. Create a Dailymotion API key at https://www.dailymotion.com/settings/developer')
  console.log('\t2. Expose it as an environment variable : `export DM_API_KEY=<API key>`')
  console.log('\n')
  /* eslint-enable no-console */
}

module.exports = {
  entry: path.resolve(__dirname, './src/scripts/index.js'),
  output: {
    path: 'dist',
    filename: '[name].js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'es2016']
      }
    }, {
      test: /\.svg$/,
      exclude: /node_modules/,
      loader: 'raw-loader'
    }, {
       test: /\.scss$/,
       loader: ExtractTextPlugin.extract('style-loader', sassLoaders.join('!'))
    }, {
      loader : 'imports?this=>window!exports-loader?localforage',
      test   : /localforage\.min\.js$/
    }],
    //Don't parse 'require' inside localforage because wepack can't resolve it coorectly
    noParse: /localforage\./,
  },
  alias: {
    localforage: 'localforage/'
  },
  resolve: {
    extensions: ['', '.js', '.scss']
  },
  plugins: [
    // Get the dailymotion API key from the environment variables
    // Create your own API key at https://www.dailymotion.com/settings/developer
    new webpack.DefinePlugin({
      DM_API_KEY : `"${process.env.DM_API_KEY}"`
    }),
    new CopyWebpackPlugin([
      { from: 'src/manifest.json', to: 'manifest.json' },
      { from: 'src/images/icons.svg', to: 'images/icons.svg' },
      { from: 'src/images/logo-big.svg', to: 'images/logo-big.svg' },
    ]),
    new ExtractTextPlugin('[name].css'),
    new HtmlWebpackPlugin({
      template: 'src/index.ejs',
    }),
    // Setup Service Worker Plugin. See https://github.com/NekR/offline-plugin
    new OfflinePlugin({
      AppCache: false,
      caches: {
        main: ['index.html', 'main.css', 'main.js'],
        optional: [
          'https://fonts.gstatic.com/s/hind/v6/Pmrg92KFJKj-hq44c2dqpvesZW2xOQ-xsNqO47m55DA.woff2',
          'https://fonts.gstatic.com/s/hind/v6/j0nw79-SK78CoHOhg6MGGwLUuEpTyoUstqEm5AMlJo4.woff2',
        ],
      },
      externals: [
        'https://fonts.gstatic.com/s/hind/v6/Pmrg92KFJKj-hq44c2dqpvesZW2xOQ-xsNqO47m55DA.woff2',
        'https://fonts.gstatic.com/s/hind/v6/j0nw79-SK78CoHOhg6MGGwLUuEpTyoUstqEm5AMlJo4.woff2',
      ],
      // WARNING in OfflinePlugin: Cache sections `additional` and `optional` could be used only when each asset passed
      // to it has unique name (e.g. hash or version in it) and is permanently available for given URL. If you think
      // that it' your case, set `safeToUseOptionalCaches` option to `true`, to remove this warning.
      safeToUseOptionalCaches: true,
    })
  ],
  // debug: true,
  devtool: (process.env.NODE_ENV !== 'production') ? 'inline-source-map' : false,
}