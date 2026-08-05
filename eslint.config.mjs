import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      }
    },
    plugins: {
      prettier
    },
    rules: {
      // Règles ESLint de base
      ...js.configs.recommended.rules,

      // Intégration Prettier
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 80,
          tabWidth: 2,
          semi: true,
          arrowParens: 'always',
          endOfLine: 'auto'
        }
      ],

      // Désactiver les règles de style qui peuvent entrer en conflit avec Prettier
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',

      // Règles de style et de bonnes pratiques
      'eqeqeq': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      }
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
    }
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.cache/'
    ]
  }
];