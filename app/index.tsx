import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import logo from '../assets/images/logo.png';

const API_BASE_URL = 'http://172.20.10.2:3333/api';

export default function App() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function fazerLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message);
        return;
      }

      // 🔥 AQUI ESTÁ A MÁGICA
      if (data.tipo === 'ADM') {
        router.replace('/painelAdm');
      } else if (data.tipo === 'CLIENTE') {
        router.replace('/homepage');
      } else if (data.tipo === 'EMPRESARIO') {
        router.replace('/homepage'); // pode mudar depois
      }

    } catch (error) {
      Alert.alert('Erro', 'Erro ao conectar com servidor');
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>

        <View style={styles.top}>
          <Image source={logo} style={{ marginTop: 60, width: 125, height: 125 }} />

          <Text style={styles.title}>Urban Book</Text>
          <Text style={styles.subtitle}>
            Encontre profissionais perto de você
          </Text>
        </View>

        <View style={styles.bottom}>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity onPress={() => router.push('/RecSenha')}>
            <Text style={styles.forgot}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={fazerLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/cad_cliente')}
          >
            <Text style={styles.registerText}>Cadastre-se</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => router.push('/homepage')}
          >
            <Text>Continuar com Google</Text>
          </TouchableOpacity>

        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },

  top: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },

  logo: {
    marginTop: 80,
    width: 80,
    height: 80,
    marginBottom: 10
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold'
  },

  subtitle: {
    textAlign: 'center',
    marginTop: 5
  },

  bottom: {
    flex: 2,
    backgroundColor: '#67C5C0',
    padding: 25,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 0
  },

  label: {
    marginTop: 10,
    marginBottom: 5,
    color: '#000'
  },

  input: {
    backgroundColor: '#eaeaea',
    padding: 12,
    borderRadius: 10
  },

  forgot: {
    marginTop: 5,
    textDecorationLine: 'underline'
  },

  loginButton: {
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15
  },

  loginText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  registerButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },

  registerText: {
    fontWeight: 'bold'
  },

  googleButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20
  }
});