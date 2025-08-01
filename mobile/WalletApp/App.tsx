// App.tsx
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();

import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => <AppNavigator />;
export default App;
