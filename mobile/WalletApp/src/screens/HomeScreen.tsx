// mobile/WalletApp/src/screens/HomeScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('Usuario');

  const screenWidth = Dimensions.get('window').width;
  const CARD_WIDTH = screenWidth * 0.8;

  const loadBalance = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        return navigation.replace('Login');
      }

      const res = await fetch('http://10.0.2.2:3001/saldo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        await AsyncStorage.removeItem('userToken');
        return Alert.alert(
          'Sesión expirada',
          'Tu sesión ha vencido. Por favor inicia sesión de nuevo.',
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
      }

      const json = (await res.json()) as {
        balance: number;
        name?: string;
        error?: string;
      };

      if (res.ok) {
        setBalance(json.balance);
        setUserName(json.name ?? 'Usuario');
      } else {
        Alert.alert('Error', json.error || 'No fue posible obtener el saldo');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadBalance();
    }, [loadBalance])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* === Header === */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {userName}</Text>
      </View>

      {/* === Balance Card === */}
      <View style={[styles.card, { width: CARD_WIDTH, flex: 3 }]}>
        <View style={styles.balanceCircle}>
          <Text style={styles.balanceValue}>
            {balance != null ? balance.toLocaleString() : '...'}
          </Text>
          <Text style={styles.balanceLabel}>Disponible</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadBalance}>
          <Text style={styles.refreshText}>Refrescar</Text>
        </TouchableOpacity>
      </View>

      {/* === Actions Card === */}
      <View style={[styles.card, { width: CARD_WIDTH, flex: 2 }]}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Transfer')}
        >
          <Text style={styles.actionText}>Transferir Dinero</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.actionText}>Ver Historial</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    alignItems: 'center',
  },
  header: {
    width: '90%',
    marginVertical: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    alignItems: 'center',
    elevation: 4,
  },
  balanceCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e6f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
  },
  balanceLabel: {
    marginTop: 4,
    fontSize: 14,
    color: '#0066ff',
  },
  refreshBtn: {
    backgroundColor: '#0066ff',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  refreshText: {
    color: '#fff',
    fontSize: 16,
  },
  actionBtn: {
    backgroundColor: '#0066ff',
    paddingVertical: 14,
    borderRadius: 6,
    marginVertical: 8,
    alignSelf: 'stretch',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
