module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "max-len": "off",
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
  },
};