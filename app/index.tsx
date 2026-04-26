import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import logo from '../assets/images/logo.png';

const API_URL = 'http://172.20.10.2:3333/api';

export default function App() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/empresarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      
      const data = await response.json();

      if (response.ok) {
        // 🟢 SALVA O ID NO CELULAR
        await AsyncStorage.setItem('id_usuario', String(data.id));
        router.push('/perfil-empresa'); 
      } else {
        // 🟢 AQUI CAI A TRAVA DA JÚLIA (SE ID_ADM FOR NULL)
        Alert.alert('Erro no Login', data.error || 'Credenciais inválidas.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Verifique se o backend está rodando no IP .2');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.top}>
          <Image source={logo} style={{marginTop: 60, width: 125, height: 125 }} />
          <Text style={styles.title}>Urban Book</Text>
          <Text style={styles.subtitle}>Encontre profissionais perto de você</Text>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput 
            style={styles.input} 
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
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

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/cad_cliente')}>
            <Text style={styles.registerText}>Cadastre-se</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.googleButton} onPress={() => router.push('/homepage')}>
            <Text>Continuar com Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  top: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { textAlign: 'center', marginTop: 5 },
  bottom: { flex: 2, backgroundColor: '#67C5C0', padding: 25, borderTopLeftRadius: 50, borderTopRightRadius: 0 },
  label: { marginTop: 10, marginBottom: 5, color: '#000' },
  input: { backgroundColor: '#eaeaea', padding: 12, borderRadius: 10 },
  forgot: { marginTop: 5, textDecorationLine: 'underline' },
  loginButton: { backgroundColor: '#333', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  loginText: { color: '#fff', fontWeight: 'bold' },
  registerButton: { backgroundColor: '#fff', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  registerText: { fontWeight: 'bold' },
  googleButton: { backgroundColor: '#fff', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 }
});