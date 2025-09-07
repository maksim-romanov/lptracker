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

// module.exports = wrapWithReanimatedMetroConfig(config);
module.exports = config;
