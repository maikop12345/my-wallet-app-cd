module.exports = {
  parser: '@babel/eslint-parser',
  root: true,
  extends: ['@react-native-community'],
  env: {
    'react-native/react-native': true,
  },
  ignorePatterns: [
    // deja de lintar cualquier archivo de configuración de Jest
    'jest.config.js',
    'jest/**/*.js',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['module:metro-react-native-babel-preset'],
    },
  },
  rules: {
    // aquí tus overrides, por ejemplo:
    // 'no-console': 'off',
  },
};
