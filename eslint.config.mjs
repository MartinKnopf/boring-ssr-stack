import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'
import html from '@html-eslint/eslint-plugin'
import htmlParser from '@html-eslint/parser'

export default [
  {
    ignores: ['**/cdk.out/**', '**/dist/**', '**/dist-ts/**', '**/node_modules/**', '**/public/**', 'apps/data/resources/prod-dump/**'], // Ignore CDK-generated files and build outputs
  },
  // JavaScript/Node.js files
  {
    files: ['packages/**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: [
      'packages/server/src/frontend/**/*.{js,vue}',
    ],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
  // Apply JS recommended rules only to JS/Vue files
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    ...js.configs.recommended,
  },
  // Apply Vue rules only to Vue files
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
  },
  eslintConfigPrettier,
  // Rules that override prettier config
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    rules: {
      curly: ['error', 'all'],
    },
  },
  // HTML files configuration
  {
    files: ['packages/server/**/*.html'],
    plugins: {
      html: html,
    },
    languageOptions: {
      parser: htmlParser,
    },
    rules: {
      ...html.configs.recommended.rules,
      'html/indent': 'off', // Allow flexible indentation
      'html/require-closing-tags': 'off', // Allow self-closing tags
      'html/attrs-newline': 'off', // Allow attributes on same line
      'html/no-extra-spacing-attrs': 'off', // Allow flexible spacing in attributes
      'html/no-duplicate-id': 'error',
      'html/no-duplicate-attrs': 'error',
    },
  },
]
