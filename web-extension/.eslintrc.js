module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    '@vue/typescript',
    'plugin:prettier/recommended',
    'plugin:vue/recommended',
    'prettier/vue',
    'prettier-standard'
  ],
  rules: {
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser'
  }
}
