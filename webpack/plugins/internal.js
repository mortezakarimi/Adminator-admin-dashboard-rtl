/**
 * Internal webpack plugins.
 *
 * Intentionally empty: HotModuleReplacementPlugin used to be registered here
 * for development, but `devServer.hot: true` (see webpack/devServer.js) already
 * adds it. Registering both makes webpack-dev-server warn about a duplicate
 * HMR plugin and wires the runtime twice.
 */
module.exports = [];
