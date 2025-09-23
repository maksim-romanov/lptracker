module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "babel-plugin-transform-typescript-metadata",
      [
        "react-native-unistyles/plugin",
        {
          root: "./src",
          autoProcessPaths: ["@grapp/stacks"],
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
