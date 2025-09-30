const { getDefaultConfig } = require("expo/metro-config");
// const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const { transformer } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts.push("svg");

config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
  },
};

// Prefer legacy resolution over package "exports" maps to avoid noisy warnings
// like attempted subpath imports (e.g. "@noble/hashes/crypto.js").
config.resolver.unstable_enablePackageExports = false;

// Add Node.js core module polyfills for React Native
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  events: require.resolve("events/"),
};

// module.exports = wrapWithReanimatedMetroConfig(config);
module.exports = config;
