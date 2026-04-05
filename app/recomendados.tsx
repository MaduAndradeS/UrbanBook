import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EscolhaPerfil() {

  const router = useRouter();

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>Como deseja usar o app?</Text>

      {/* BOTÃO CLIENTE */}
      <TouchableOpacity
        style={styles.botao}
        onPress={() => router.push('/Cliente_Datas')}
      >
        <Text style={styles.textoBotao}>Sou Cliente</Text>
      </TouchableOpacity>

      {/* BOTÃO EMPRESÁRIO */}
      <TouchableOpacity
        style={[styles.botao, { backgroundColor: '#000' }]}
        onPress={() => router.push('/Emp_Dispo')}
      >
        <Text style={[styles.textoBotao, { color: '#fff' }]}>
          Sou Empresário
        </Text>
      </TouchableOpacity>

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center'
  },

  botao: {
    width: '80%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#67C5C0',
    alignItems: 'center',
    marginBottom: 20
  },

  textoBotao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  }
});