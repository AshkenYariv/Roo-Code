import baseConfig from '../../packages/config-eslint/base.js'

export default [
  ...baseConfig,
  {
    ignores: [
      'dist/',
      'dist-esm/',
      'node_modules/',
      'coverage/',
      '*.d.ts'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Package-specific rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*'],
    rules: {
      // Relaxed rules for tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
] 