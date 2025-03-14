import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import airbnbBase from 'eslint-config-airbnb-base'
import reactPlugin from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import prettierConfig from 'eslint-config-prettier'

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  ...airbnbBase.configs.recommended,
  reactPlugin.configs.recommended,
  reactHooks.configs.recommended,
  jsxA11y.configs.recommended,
  importPlugin.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react': reactPlugin,
      'jsx-a11y': jsxA11y,
      'import': importPlugin,
    },
    rules: {
      // Airbnb 스타일 규칙 중 일부 커스터마이징
      'react/react-in-jsx-scope': 'off', // React 17 이상에서는 import React 필요 없음
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
