// eslint.config.js
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    // Vendored Bootstrap theme assets — not ours to lint.
    ignores: ['node_modules/**', 'public/assets/**', 'package-lock.json'],
  },

  js.configs.recommended,

  {
    // Server-side CommonJS: controllers, models, middleware, lib, index.js
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      // Express error handlers must keep a 4-arg signature even when `next`
      // is unused, so unused *arguments* are not an error here. Unused
      // variables and imports still are — that is the rule worth having.
      // ignoreRestSiblings allows the destructure-to-omit idiom used to strip
      // passwords out of flashed form data (controllers/storeUser.js).
      'no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
      'no-undef': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
    },
  },

  {
    // Browser bundle served from public/js
    files: ['public/js/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: { ...globals.browser },
    },
  },

  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
