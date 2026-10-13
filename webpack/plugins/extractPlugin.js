const
  manifest          = require('../manifest'),
  ExtractTextPlugin = require('mini-css-extract-plugin');

module.exports = new ExtractTextPlugin({
  filename: manifest.outputFiles.css,
  /* Async chunks need their own name pattern. jsvectormap's stylesheet now
     arrives via a dynamic import(), so without chunkFilename it would collide
     with the main stylesheet's name. */
  chunkFilename: manifest.IS_PRODUCTION ? '[name].[contenthash:8].css' : '[name].css',
});
