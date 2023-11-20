import antfu from '@antfu/eslint-config'

import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default antfu({}, {
  rules: {
    'vue/block-order': ['error', {
      order: ['template', 'script', 'style'],
    }],
  },
}, ...compat.config({
  extends: 'plugin:tailwindcss/recommended',
}))
