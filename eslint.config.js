// @ts-check
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      complexity: ["warn", 15],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // Build tooling: Node/ESM context.
    files: ["config/**/*.ts", "lib/**/*.ts", "tasks/**/*.ts", "types/**/*.ts", "gulpfile.ts", "*.config.js"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Example project source: browser context, plain JS by default (TS is opt-in).
    files: ["src/scripts/**/*.js"],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  eslintConfigPrettier,
);
