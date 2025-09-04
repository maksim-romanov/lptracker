// https://docs.expo.dev/guides/using-eslint/
const cspellConfigs = require("@cspell/eslint-plugin/configs");
const json = require("@eslint/json").default;
const markdown = require("@eslint/markdown").default;
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const importPlugin = require("eslint-plugin-import");
const jest = require("eslint-plugin-jest");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  markdown.configs.recommended,
  eslintPluginPrettierRecommended,
  cspellConfigs.recommended,
  {
    ignores: ["dist/*", ".expo/*", "node_modules/*"],
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    extends: [importPlugin.flatConfigs["react-native"], expoConfig],
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling"]],
          pathGroups: [{ pattern: "react", group: "builtin", position: "before" }],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "prettier/prettier": ["error", { printWidth: 120 }],
    },
  },
  {
    files: ["**/*.json"],
    ignores: ["package-lock.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.spec.ts", "**/*.spec.tsx", "jest.*"],
    ...jest.configs["flat/recommended"],
  },
]);
