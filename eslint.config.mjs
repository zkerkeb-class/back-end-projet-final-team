import globals from 'globals';
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 80,
          tabWidth: 2,
          semi: true,
          arrowParens: 'always',
        },
      ],

      // Additional strict rules
      'no-console': 'warn',
      'no-unused-vars': 'error',
      complexity: ['error', 10],
      'max-lines-per-function': ['error', 50],

      // Additional best practices
      eqeqeq: 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'build/', '.cache/', '**/*.min.js'],
  },
];
