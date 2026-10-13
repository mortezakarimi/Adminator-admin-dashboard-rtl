/**
 * Loader rules.
 *
 * Note: there is deliberately no rule for .js — webpack 5 parses ES modules
 * natively, and the browserslist floor (Chrome/Firefox 90, Safari/iOS 15) is
 * modern enough that a transpile step is a no-op. Babel was removed in 4.2.0
 * after an A/B build showed byte-equivalent output. If you ever widen
 * `browserslist` to older engines, reintroduce babel-loader here.
 */
module.exports = [
  require('./images'),
  require('./css'),
  require('./sass'),
  require('./fonts'),
];
