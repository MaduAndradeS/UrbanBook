import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import logo from '../../assets/images/logo.png';
export default function App() {
  const router = useRouter();
  return (
    <View style={styles.container}>

      <View style={styles.top}>

        <Image source={logo} style={{marginTop: 60, width: 125, height: 125 }} />

        <Text style={styles.title}>Urban Book</Text>
        <Text style={styles.subtitle}>
          Encontre profissionais perto de você
        </Text>
      </View>

      <View style={styles.bottom}>

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} />

        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} secureTextEntry />

        <Text style={styles.forgot}>Esqueceu a senha?</Text>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/cad_emp')}>
          <Text style={styles.registerText}>Cadastre-se</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton}>
          <Text>Continuar com Google</Text>
        </TouchableOpacity>

      </View>

    </View>
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