import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import logo from '../assets/images/logo.png';

export default function RecSenha() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRedefinir() {
    if (!codigo || !novaSenha || !confirmar) {
      alert('Preencha todos os campos');
      return;
    }
    if (novaSenha !== confirmar) {
      alert('As senhas não coincidem');
      return;
    }
    if (novaSenha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://10.0.124.2:3333/api/auth/redefinir-senha', {
        token: codigo,
        novaSenha
      });
      alert('Senha redefinida com sucesso!');
      router.replace('/');
    } catch (err) {
      const error = err as any;
      const msg =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao redefinir senha';
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
        <Text style={styles.subtitle}>Redefinição de senha</Text>
      </View>

      <ScrollView contentContainerStyle={styles.bottom}>
        <Text style={styles.orient}>
          Digite o código recebido no e-mail{email ? ` (${email})` : ''}
        </Text>

        <Text style={styles.label}>Código</Text>
        <TextInput
          style={styles.input}
          value={codigo}
          onChangeText={setCodigo}
          placeholder="Digite o código de 6 dígitos"
          keyboardType="numeric"
          maxLength={6}
        />

        <Text style={styles.label}>Nova senha</Text>
        <TextInput
          style={styles.input}
          value={novaSenha}
          onChangeText={setNovaSenha}
          placeholder="Digite a nova senha"
          secureTextEntry
        />

        <Text style={styles.label}>Confirmar senha</Text>
        <TextInput
          style={styles.input}
          value={confirmar}
          onChangeText={setConfirmar}
          placeholder="Confirme a nova senha"
          secureTextEntry
        />

        <Pressable style={styles.loginButton} onPress={handleRedefinir} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.loginText}>Redefinir senha</Text>
          }
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { textAlign: 'center', marginTop: 5 },
  logo: { marginBottom: 8, width: 125, height: 125 },
  bottom: { flexGrow: 1, backgroundColor: '#67C5C0', padding: 25, borderTopLeftRadius: 50 },
  label: { marginTop: 10, marginBottom: 5, color: '#000' },
  input: { backgroundColor: '#eaeaea', padding: 12, borderRadius: 10 },
  loginButton: { backgroundColor: '#333', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  loginText: { color: '#fff', fontWeight: 'bold' },
  orient: { textAlign: 'center', fontSize: 17, marginTop: 10, marginBottom: 10 }
});