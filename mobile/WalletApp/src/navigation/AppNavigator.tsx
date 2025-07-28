// mobile/WalletApp/src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, Text } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import TransferScreen from '../screens/TransferScreen';
import HistoryScreen from '../screens/HistoryScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Transfer: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* === LOGIN === */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Iniciar Sesión',
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />

        {/* === HOME === */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'Mi Wallet',
            headerBackVisible: false,
            gestureEnabled: false,
            headerRight: () => (
              <TouchableOpacity
                onPress={async () => {
                  await AsyncStorage.removeItem('userToken');
                  navigation.replace('Login');
                }}
                style={{ paddingHorizontal: 16 }}
              >
                <Text style={{ color: '#0066ff', fontSize: 16 }}>Salir</Text>
              </TouchableOpacity>
            ),
          })}
        />

        {/* === TRANSFER & HISTORY (mantienen back normal) === */}
        <Stack.Screen
          name="Transfer"
          component={TransferScreen}
          options={{ title: 'Transferir Dinero' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Historial' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
