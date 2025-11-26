const nextLint = require("next/lint");

module.exports = [
  ...nextLint.configs.recommended,
  ...nextLint.configs['core-web-vitals'],
];