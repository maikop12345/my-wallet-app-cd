// mobile/WalletApp/jest.config.js
module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],

  // Aquí obligamos a que NO se ignore react-native ni sus libs nativas:
 transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-gesture-handler)",
      ],
  setupFiles: [
    // este setup es el default de RN para mocks de env
    '<rootDir>/node_modules/react-native/jest/setup.js'
  ],
};
