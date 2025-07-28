// mobile/WalletApp/src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async () => {
    setError(null);
    if (!/^\d{10}$/.test(phone)) {
      return setError('Ingresa un celular válido de 10 dígitos.');
    }
    setLoading(true);
    try {
      const res = await fetch('http://10.0.2.2:3001/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      setLoading(false);

      if (res.ok) {
        setStep('otp');
      } else {
        setError(json.error || 'No se pudo enviar el OTP.');
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message);
    }
  };

  const doLogin = async () => {
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      return setError('El OTP debe tener 6 dígitos.');
    }
    setLoading(true);
    try {
      const res = await fetch('http://10.0.2.2:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const json = await res.json();
      setLoading(false);

      if (res.ok && json.token) {
        await AsyncStorage.setItem('userToken', json.token);
        navigation.replace('Home');
      } else {
        setError(json.error || 'Login fallido. Intenta de nuevo.');
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message);
    }
  };

  const goBackToPhone = () => {
    // limpia OTP y mensaje de error, vuelve al paso de teléfono
    setOtp('');
    setError(null);
    setStep('phone');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar Sesión</Text>

        {step === 'phone' ? (
          <>
            <Text style={styles.label}>Número de celular</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={10}
              placeholder="3001234567"
              value={phone}
              onChangeText={setPhone}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={sendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Generar OTP</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Ingresa tu OTP</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChangeText={setOtp}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={doLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            {/* Botón para regresar y generar nuevo OTP */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={goBackToPhone}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const BUTTON_HEIGHT = 48;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: BUTTON_HEIGHT,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#b00020',
    marginBottom: 12,
  },
  button: {
    height: BUTTON_HEIGHT,
    borderRadius: 4,
    backgroundColor: '#0066ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#aac4ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    marginTop: 12,
    alignSelf: 'center',
    padding: 8,
  },
  backButtonText: {
    color: '#0066ff',
    fontSize: 16,
  },
});
