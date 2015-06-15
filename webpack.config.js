'use strict'

var webpack = require('webpack')
var path = require('path')
var isDev = true // !!process.env.WEBPACK_DEV

module.exports = {
  devtool: isDev ? 'eval-source-map' : null,

  context: __dirname,

  entry: 'index',

  output: {
    // Where to put build results when doing production builds:
    // (Server doesn't write to the disk, but this is required.)
    path: __dirname,

    // JS filename you're going to use in HTML
    filename: 'turbine.js',

    // Path you're going to use in HTML
    publicPath: '/'
  },

  resolve: {
    // Allow to omit extensions when requiring these files
    extensions: ['', '.js'],
    alias: {
      lib: path.resolve(__dirname, 'lib')
    }
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader?stage=0'],
        exclude: [/node_modules/]
      }
    ]
  },

  plugins: [
    new webpack.NoErrorsPlugin()
  ]
}
