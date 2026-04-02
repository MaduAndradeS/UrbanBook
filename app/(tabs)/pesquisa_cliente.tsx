import { View, Text, TextInput, StyleSheet, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import logo from '@/assets/images/logo.png';
import React from 'react';

const dados = [
  { id: '1', titulo: 'Encanador', img1: require('@/assets/images/encanador1.png'), img2: require('@/assets/images/encanador2.png') },
  { id: '2', titulo: 'Manicure', img1: require('@/assets/images/manicure1.png'), img2: require('@/assets/images/manicure2.png') },
  { id: '3', titulo: 'Cabeleireiro', img1: require('@/assets/images/cabeleireiro1.png'), img2: require('@/assets/images/cabeleireiro2.png') },
  { id: '4', titulo: 'Limpeza', img1: require('@/assets/images/limpeza1.png'), img2: require('@/assets/images/limpeza2.png') },
  { id: '5', titulo: 'Podologia', img1: require('@/assets/images/podologia1.png'), img2: require('@/assets/images/podologia2.png') },
  { id: '6', titulo: 'Barbeiro', img1: require('@/assets/images/barbeiro1.png'), img2: require('@/assets/images/barbeiro2.png') },
  { id: '7', titulo: 'Eletricista', img1: require('@/assets/images/eletricista1.jpg'), img2: require('@/assets/images/eletricista2.jpg') },
  { id: '8', titulo: 'Depilação', img1: require('@/assets/images/depilacao1.jpg'), img2: require('@/assets/images/depilacao2.jpg') },
];

export default function PesquisaCliente() {
  return (
    <FlatList
      data={dados}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 20,
        backgroundColor: '#ffffff',
        paddingHorizontal: 10
      }}
      columnWrapperStyle={{
        gap: 10
      }}

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
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>{item.titulo}</Text>

          <View style={styles.imagensContainer}>
            <Image source={item.img1} style={styles.imgMain} />
            <Image source={item.img2} style={styles.imgOverlay} />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
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
    color: '#757575',
    marginLeft: 20
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
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 15,
    marginBottom: 10,
    color: '#000'
  },

  card: {
    flex: 1,
    marginHorizontal: 5,
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