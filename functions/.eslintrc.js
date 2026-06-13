module.exports = {
  root: true,
  env: {
    es6:  true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    // Google base rules
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback":  "error",
    "quotes": ["error", "double", { "allowTemplateLiterals": true }],

    // Custom rules
    "no-console":       "off",        // Cloud Functions use console for logging
    "no-unused-vars":   ["error", { "argsIgnorePattern": "^_" }],
    "no-var":           "error",
    "prefer-const":     "error",
    "eqeqeq":           "error",
    "no-throw-literal": "error",
  },
  overrides: [
    {
      // Test files — allow vitest globals
      files: ["**/*.test.*", "**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};