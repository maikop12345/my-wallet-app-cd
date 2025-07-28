// mobile/WalletApp/src/screens/TransferScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Transfer'>;

export default function TransferScreen({ navigation }: Props) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);

  const { width: screenWidth } = useWindowDimensions();
  const CARD_WIDTH = screenWidth * 0.9;

  // Traer el saldo actual para validación local
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          return;
        }
        const res = await fetch('http://10.0.2.2:3001/saldo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = (await res.json()) as { balance: number };
          setCurrentBalance(json.balance);
        }
      } catch {}
    })();
  }, []);

  const doTransfer = useCallback(async () => {
    setError(null);

    // 1) Validar celular destino
    if (!/^\d{10}$/.test(to)) {
      setError('Celular destino inválido (10 dígitos).');
      return;
    }
    // 2) Validar solo dígitos y punto decimal
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      setError('Monto inválido (solo números y hasta dos decimales).');
      return;
    }
    const amt = parseFloat(amount);
    // 3) Validar mayor que cero
    if (amt <= 0) {
      setError('El monto debe ser mayor que cero.');
      return;
    }
    // 4) Validar monto <= saldo disponible
    if (amt > currentBalance) {
      setError(
        `No puedes transferir más de $${currentBalance.toLocaleString()}.`
      );
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Sin token de sesión');
      }

      const res = await fetch('http://10.0.2.2:3001/transferir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to, amount: amt }),
      });
      const json = await res.json();

      // 5) Token expirado
      if (res.status === 401) {
        await AsyncStorage.removeItem('userToken');
        return Alert.alert(
          'Sesión expirada',
          'Por favor inicia sesión de nuevo.',
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
      }

      // 6) Errores del servidor
      if (!res.ok) {
        setError(json.error || 'Transferencia fallida');
        return;
      }

      // 7) Éxito
      Alert.alert('Éxito', `Se transfirieron $${amt.toLocaleString()}.`, [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (e: any) {
      setError(e.message || 'Error de red');
    } finally {
      setLoading(false);
    }
  }, [to, amount, currentBalance, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Formulario */}
      <View style={[styles.card, { width: CARD_WIDTH }]}>
        <Text style={styles.title}>Transferir Dinero</Text>

        <Text style={styles.label}>Celular destino</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="3001234567"
          value={to}
          onChangeText={(text) => setTo(text.replace(/[^0-9]/g, ''))}
        />

        <Text style={styles.label}>Monto a transferir</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="15000"
          value={amount}
          onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
        />

        <Text style={styles.balanceText}>
          Saldo disponible: ${currentBalance.toLocaleString()}
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* Botón */}
      <View style={[styles.card, styles.actionCard, { width: CARD_WIDTH }]}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={doTransfer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Transferir</Text>
          )}
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
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    elevation: 4,
  },
  actionCard: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginTop: 8,
    color: '#333',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginTop: 4,
    backgroundColor: '#fafafa',
  },
  balanceText: {
    marginTop: 12,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 8,
    color: '#b00020',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0066ff',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 6,
  },
  buttonDisabled: {
    backgroundColor: '#aac4ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
