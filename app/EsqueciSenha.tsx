import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import logo from '../assets/images/logo.png';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { tipo } = useLocalSearchParams();

  async function handleEnviar() {
    if (!email) {
      alert('Digite seu e-mail');
      return;
    }

    setLoading(true);
    try {
      const rota = tipo === 'empresario'
        ? '/api/empresarios/esqueci-senha'
        : '/api/clientes/esqueci-senha';

      await axios.post('http://10.0.124.2:3333/api/auth/esqueci-senha', { email });
        router.push({ pathname: '/RecSenha', params: { email } });
      alert('Código enviado! Verifique seu e-mail.');
      router.push({ pathname: '/RecSenha', params: { email, tipo } });
    } catch (err) {
      const error = err as any;
      const msg =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao enviar e-mail';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>Urban Book</Text>
        <Text style={styles.subtitle}>Recuperação de senha</Text>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.orient}>
          Enviaremos um código de verificação ao seu e-mail
        </Text>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Digite seu e-mail"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Pressable style={styles.loginButton} onPress={handleEnviar} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.loginText}>Enviar código</Text>
          }
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.voltar}>Voltar para o login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { textAlign: 'center', marginTop: 5 },
  logo: { marginBottom: 8, width: 125, height: 125 },
  bottom: { flex: 2, backgroundColor: '#67C5C0', padding: 25, borderTopLeftRadius: 50 },
  label: { marginTop: 10, marginBottom: 5, color: '#000' },
  input: { backgroundColor: '#eaeaea', padding: 12, borderRadius: 10 },
  loginButton: { backgroundColor: '#333', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  loginText: { color: '#fff', fontWeight: 'bold' },
  orient: { textAlign: 'center', fontSize: 17, marginTop: 10, marginBottom: 10 },
  voltar: { textAlign: 'center', marginTop: 15, textDecorationLine: 'underline' }
});