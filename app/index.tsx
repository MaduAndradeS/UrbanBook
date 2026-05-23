import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import logo from '../assets/images/logo.png';
import { API_URL } from '../config/api';

export default function App() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [logando, setLogando] = useState(false); // Novo estado para o botão

  useEffect(() => {
    async function verificarSessao() {
      try {
        const idSalvo = await AsyncStorage.getItem('id_usuario');
        if (idSalvo) {
          router.replace('/(tabs)/homepage');
        } else {
          setCarregando(false);
        }
      } catch (error) {
        setCarregando(false);
      }
    }
    verificarSessao();
  }, []);

  async function fazerLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha');
      return;
    }

    setLogando(true); // O botão começa a girar

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Credenciais inválidas');
        setLogando(false);
        return;
      }

      let id = null;
      if (data.tipo === 'EMPRESARIO') {
        id = data.usuario?.ID_EMPRESARIO;
      } else if (data.tipo === 'CLIENTE') {
        id = data.usuario?.ID_CLIENTE;
      }

      if (!id) {
        if (data.tipo === 'ADM') {
        router.replace('/painelAdm');
      } else{
        Alert.alert("Erro", "ID do usuário não retornado pelo servidor");
        setLogando(false);
        return;
      }
    }

      await AsyncStorage.setItem('id_usuario', String(id));
      await AsyncStorage.setItem('tipo_usuario', data.tipo);

      if (data.tipo === 'ADM') {
        router.replace('/painelAdm');
      } else {
        router.replace('/(tabs)/homepage');
      }

    } catch (error) {
      // Se cair aqui, é porque o IP está errado ou o Backend está desligado
      Alert.alert('Erro de Conexão', 'Verifique se o backend está ligado e se o IP em config/api.ts está correto.');
    } finally {
      setLogando(false); // O botão para de girar
    }
  }

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#67C5C0" />
      </View>
    );
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
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!logando}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            editable={!logando}
          />

          <TouchableOpacity onPress={() => router.push('/RecSenha')} disabled={logando}>
            <Text style={styles.forgot}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {/* Botão de login com estado de carregamento */}
          <TouchableOpacity 
            style={[styles.loginButton, logando && { opacity: 0.7 }]} 
            onPress={fazerLogin}
            disabled={logando}
          >
            {logando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/cad_cliente')}
            disabled={logando}
          >
            <Text style={styles.registerText}>Cadastre-se</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => router.replace('/EsperaAprov')}
            disabled={logando}
          >
            <Text>Continuar com Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#ffffff' },
  top: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { textAlign: 'center', marginTop: 5 },
  bottom: { flex: 2, backgroundColor: '#67C5C0', padding: 25, borderTopLeftRadius: 50 },
  label: { marginTop: 10, marginBottom: 5, color: '#000' },
  input: { backgroundColor: '#eaeaea', padding: 12, borderRadius: 10 },
  forgot: { marginTop: 5, textDecorationLine: 'underline' },
  loginButton: { backgroundColor: '#333', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  loginText: { color: '#fff', fontWeight: 'bold' },
  registerButton: { backgroundColor: '#fff', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  registerText: { fontWeight: 'bold' },
  googleButton: { backgroundColor: '#fff', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 }
});