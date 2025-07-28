module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'script'
  },
  extends: [
    'eslint:recommended'
  ],
  rules: {
    'no-undef': 'off',
  },
};
