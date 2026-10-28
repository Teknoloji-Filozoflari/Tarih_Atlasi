/* global __dirname */
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
const { createPlacesMiddleware } = require('./scripts/places/static.cjs');
// Opaque, hash-verified data assets: never parse the whole historical archive into JS.
config.resolver.assetExts.push('atlas');
// Raw downloads and preserved previous generators are never application modules.
const previousBlocks = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(previousBlocks) ? previousBlocks : previousBlocks ? [previousBlocks] : []),
  /[/\\]data[/\\]staging[/\\]/,
];
// Hosted CI runners OOM under default Metro parallelism during android export.
// GitHub Actions sets CI=true (not CI=1); treat any truthy CI like the rest of the repo.
if (process.env.CI) {
  config.maxWorkers = 1;
}
const enhance = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) =>
  createPlacesMiddleware(__dirname, enhance ? enhance(middleware, server) : middleware);
module.exports = config;
