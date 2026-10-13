const
  path              = require('path'),
  manifest          = require('../manifest'),
  HtmlWebpackPlugin = require('html-webpack-plugin');

const titles = {
  'index': 'Adminator · Dashboard',
  'email': 'Adminator · Email',
  'calendar': 'Adminator · Calendar',
  'chat': 'Adminator · Chat',
  'compose': 'Adminator · Compose',
  'charts': 'Adminator · Charts',
  'forms': 'Adminator · Forms',
  'ui': 'Adminator · UI Elements',
  'buttons': 'Adminator · Buttons',
  'basic-table': 'Adminator · Basic Table',
  'datatable': 'Adminator · Data Table',
  'google-maps': 'Adminator · Google Maps',
  'vector-maps': 'Adminator · Vector Maps',
  'blank': 'Adminator · Blank',
  'signin': 'Adminator · Sign In',
  'signup': 'Adminator · Sign Up',
  '404': 'Adminator · 404',
  '500': 'Adminator · 500',
};

let minify = {
  collapseWhitespace: false,
  minifyCSS: false,
  minifyJS: false,
  removeComments: true,
  useShortDoctype: false,
};

if (manifest.MINIFY) {
  minify = {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
    useShortDoctype: true,
  };
}


// Every page is now a 2026 page. They all get the 2026 bundle and nothing else.
module.exports = Object.keys(titles).map(title => {
  return new HtmlWebpackPlugin({
    template: path.join(manifest.paths.src, `${title}.html`),
    path: manifest.paths.build,
    filename: `${title}.html`,
    chunks: ['runtime', '2026'],
    inject: true,
    minify,
  });
});
