import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Pressable } from 'react-native';
import logo from '../assets/images/logo.png';
import { useState } from 'react';
import { useRouter } from 'expo-router';
export default function ReplacePass() {

  const [userMail, setUserMail] = useState('');
  const router = useRouter();

  function replacePass() {
    if (userMail!='') {

    } else {
      alert("É preciso inserir um e-mail válido para efetuar a redefinição de senha");
      return;
    }
  }

  return (
    <View style={styles.container}>

      <View style={styles.top}>

        <Image source={logo} style={{marginTop: 60, width: 125, height: 125 }} />

        <Text style={styles.title}>Urban Book</Text>
        <Text style={styles.subtitle}>
          Recuperação de senha
        </Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.orient}>
            Enviaremos um link de recuperação ao seu E-mail
        </Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} />

        <Pressable
        style={styles.loginButton}
        onPress={replacePass}
        >
        <Text style={styles.loginText}>Enviar</Text>
        </Pressable>
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
  },

  orient: {
    textAlign: 'center',
    fontSize: 17,
    marginTop: 10,
    marginBottom: 10,
  }
});