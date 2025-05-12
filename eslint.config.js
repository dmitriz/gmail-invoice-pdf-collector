/**
 * ESLint Configuration (ESLint v9+ flat config format)
 */

const js = require('@eslint/js');
const jestPlugin = require('eslint-plugin-jest');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    plugins: {
      jest: jestPlugin
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      'jest/expect-expect': 'error',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/valid-expect': 'error'
    }
  },
  {
    files: ['**/__tests__/**/*.js'],
    rules: {
      // Any test-specific rules would go here
    }
  }
];
