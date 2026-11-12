import js from "@eslint/js";
import globals from "globals";

export default [
  // Folders ESLint should not check.
  { ignores: ["dist/", "node_modules/"] },

  // Standard recommended rules.
  js.configs.recommended,

  // App code runs in the browser as ES modules.
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
  },

  // Config files run in Node.js.
  {
    files: ["*.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
];
