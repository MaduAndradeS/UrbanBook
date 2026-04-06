import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import logo from '../../assets/images/logo.png';

const dados = [
  { id: '1', titulo: 'Encanador', img1: require('../../assets/images/encanador1.png'), img2: require('../../assets/images/encanador2.png') },
  { id: '2', titulo: 'Manicure', img1: require('../../assets/images/manicure1.png'), img2: require('../../assets/images/manicure2.png') },
  { id: '3', titulo: 'Cabeleireiro', img1: require('../../assets/images/cabeleireiro1.png'), img2: require('../../assets/images/cabeleireiro2.png') },
  { id: '4', titulo: 'Limpeza', img1: require('../../assets/images/limpeza1.png'), img2: require('../../assets/images/limpeza2.png') },
  { id: '5', titulo: 'Podologia', img1: require('../../assets/images/podologia1.png'), img2: require('../../assets/images/podologia2.png') },
  { id: '6', titulo: 'Barbeiro', img1: require('../../assets/images/barbeiro1.png'), img2: require('../../assets/images/barbeiro2.png') },
  { id: '7', titulo: 'Eletricista', img1: require('../../assets/images/eletricista1.png'), img2: require('../../assets/images/eletricista2.png') },
  { id: '8', titulo: 'Depilação', img1: require('../../assets/images/depilacao2.png'), img2: require('../../assets/images/depilacao1.png') }
];
const largura = Dimensions.get('window').width;
const CARD_WIDTH = (largura - 30) / 2; // 10 padding + 10 padding + 10 espaço

export default function PesquisaCliente() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <FlatList
        data={dados}
        style={{ flex: 1 }}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        initialNumToRender={8}

        ListHeaderComponent={
          <View>
            {/* TOPO */}
            <View style={styles.top}>
              <Text style={styles.title}>Urban Book</Text>
              <Image source={logo} style={styles.logo} />
            </View>

            {/* BARRA DE PESQUISA */}
            <View style={styles.barraPesquisa}>
              <Ionicons name="search" size={18} color="#000" />
              <TextInput
                placeholder="Pesquisar..."
                placeholderTextColor="#8e8e8e"
                style={styles.input}
              />
            </View>

            {/* TÍTULO */}
            <Text style={styles.tituloSecao}>
              Mais buscados perto de você
            </Text>
          </View>
        }

        renderItem={({ item }) => (
          <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/recomendados')}>
            <Text style={styles.cardTitulo}>{item.titulo}</Text>

            <View style={styles.imagensContainer}>
              <Image source={item.img1} style={styles.imgMain} />
              <Image source={item.img2} style={styles.imgOverlay} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },

  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 10
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10
  },

  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
  },

  logo: {
    width: 70,
    height: 70
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#757575'
  },

  barraPesquisa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#efefef',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginHorizontal: 20,
    marginTop: -10
  },

  input: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    color: '#000'
  },

  tituloSecao: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 15,
    marginBottom: 10,
    color: '#000'
  },

  card: {
    width: CARD_WIDTH,
    height: 160,
    backgroundColor: '#ffffff',
    marginBottom: 15,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4
  },

  cardTitulo: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
    textAlign: 'center'
  },

  imagensContainer: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center'
  },

  imgMain: {
    width: 80,
    height: 80,
    borderRadius: 10,
    right: 10,

  },

  imgOverlay: {
    width: 75,
    height: 75,
    borderRadius: 10,
    position: 'absolute',
    right: -20,
    bottom: -10
  }
});