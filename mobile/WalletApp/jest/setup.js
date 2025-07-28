// mobile/WalletApp/jest/setup.js

// 1) mock de react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    GestureDetector: View,
    // ...y cualquier otra exportación que uses
  };
});

// 2) mock de react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// 3) mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

// 4) mock global.fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
  })
);

// 5) silenciar los logs de warning de act() y similares
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);
