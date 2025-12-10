import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import prettierConfig from 'eslint-config-prettier'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: false
  }
}).append(
  prettierConfig,
  {
    ignores: [
      'api/**', // Old API folder (migrated to server/)
      'uploads/**',
      '.nuxt/**',
      '.output/**',
      'node_modules/**'
    ]
  },
  {
    rules: {
      // Relax some rules for existing code
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'no-console': 'warn'
    }
  }
)
