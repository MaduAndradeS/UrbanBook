import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { API_URL } from '../../config/api';

const largura = Dimensions.get('window').width;
const CARD_WIDTH = (largura - 30) / 2;

// --- DADOS ESTÁTICOS (Categorias) ---
const CATEGORIAS = [
  { id: '1', titulo: 'Encanador', img1: require('../../assets/images/encanador1.png'), img2: require('../../assets/images/encanador2.png') },
  { id: '2', titulo: 'Manicure', img1: require('../../assets/images/manicure1.png'), img2: require('../../assets/images/manicure2.png') },
  { id: '3', titulo: 'Cabeleireiro', img1: require('../../assets/images/cabeleireiro1.png'), img2: require('../../assets/images/cabeleireiro2.png') },
  { id: '4', titulo: 'Limpeza', img1: require('../../assets/images/limpeza1.png'), img2: require('../../assets/images/limpeza2.png') },
  { id: '5', titulo: 'Podologia', img1: require('../../assets/images/podologia1.png'), img2: require('../../assets/images/podologia2.png') },
  { id: '6', titulo: 'Barbeiro', img1: require('../../assets/images/barbeiro1.png'), img2: require('../../assets/images/barbeiro2.png') },
  { id: '7', titulo: 'Eletricista', img1: require('../../assets/images/eletricista1.png'), img2: require('../../assets/images/eletricista2.png') },
  { id: '8', titulo: 'Depilação', img1: require('../../assets/images/depilacao2.png'), img2: require('../../assets/images/depilacao1.png') }
];

interface Empresario {
  ID_EMPRESARIO: number;
  NOME: string;
  SERVICOS?: { NOME: string }[];
}

export default function PesquisaCliente() {
  const router = useRouter();

  const [busca, setBusca] = useState<string>('');
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Empresario[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);

  const buscarUsuarios = async (texto: string) => {
    if (texto.trim().length === 0) {
      setUsuariosFiltrados([]);
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/empresarios?busca=${encodeURIComponent(texto)}`);
      if (!response.ok) throw new Error('Erro na conexão');
      const dados = await response.json();
      setUsuariosFiltrados(dados);
    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      buscarUsuarios(busca);
    }, 400);
    return () => clearTimeout(delay);
  }, [busca]);

  // Renderizador da Busca (Lista Estilo Instagram)
  const renderItemBusca = ({ item }: { item: Empresario }) => (
    <TouchableOpacity 
      style={styles.itemBusca} 
      onPress={() => router.push({
        pathname: '/(tabs)/perfil-empresa',
        params: { id: item.ID_EMPRESARIO.toString() }
      })}
    >
      <Image 
        source={{ uri: `https://ui-avatars.com/api/?name=${item.NOME}&background=random` }} 
        style={styles.avatarBusca} 
      />
      <View>
        <Text style={styles.nomeBusca}>{item.NOME}</Text>
        <Text style={styles.servicoBusca}>{item.SERVICOS?.[0]?.NOME || 'Profissional'}</Text>
      </View>
    </TouchableOpacity>
  );

  // Renderizador das Categorias (Cards)
  const renderItemCategoria = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: '/recomendados',
        params: { categoria: item.titulo }
      })}
    >
      <Text style={styles.cardTitulo}>{item.titulo}</Text>
      <View style={styles.imagensContainer}>
        <Image source={item.img1} style={styles.imgMain} />
        <Image source={item.img2} style={styles.imgOverlay} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* BARRA DE PESQUISA */}
      <View style={styles.barraPesquisa}>
        <Ionicons name="search" size={18} color="#000" />
        <TextInput
          placeholder="Pesquisar profissionais..."
          placeholderTextColor="#8e8e8e"
          style={styles.input}
          value={busca}
          onChangeText={setBusca}
        />
        {busca !== '' && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Ionicons name="close-circle" size={18} color="#8e8e8e" />
          </TouchableOpacity>
        )}
      </View>

      {/* CONTEÚDO DINÂMICO */}
      {busca.trim().length > 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {carregando ? (
            <ActivityIndicator color="#000" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={usuariosFiltrados}
              keyExtractor={(item) => item.ID_EMPRESARIO.toString()}
              renderItem={renderItemBusca}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.vazio}>Nenhum profissional encontrado.</Text>
              }
            />
          )}
        </View>
      ) : (
        <FlatList
          data={CATEGORIAS}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.tituloSecao}>Mais buscados perto de você</Text>
          }
          renderItem={renderItemCategoria}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff',
    paddingTop: 15 // Espaço para não colar no topo agora que a logo saiu
  },
  barraPesquisa: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#efefef', 
    borderRadius: 10, 
    paddingHorizontal: 10, 
    height: 40, 
    marginHorizontal: 20, 
    marginBottom: 10 
  },
  input: { flex: 1, fontSize: 14, marginLeft: 8, color: '#000' },
  tituloSecao: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginLeft: 10, 
    marginTop: 15, 
    marginBottom: 15, 
    color: '#000' 
  },
  listContent: { paddingHorizontal: 10, paddingBottom: 30 },
  row: { justifyContent: 'space-between', marginBottom: 10 },
  card: { 
    width: CARD_WIDTH, 
    height: 160, 
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    padding: 15, 
    alignItems: 'center', 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 3 } 
  },
  cardTitulo: { fontSize: 16, marginBottom: 10, fontWeight: '500' },
  imagensContainer: { width: 100, height: 80, justifyContent: 'center', alignItems: 'center' },
  imgMain: { width: 80, height: 80, borderRadius: 10, right: 10 },
  imgOverlay: { 
    width: 75, 
    height: 75, 
    borderRadius: 10, 
    position: 'absolute', 
    right: -20, 
    bottom: -10 
  },
  itemBusca: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#eee' 
  },
  avatarBusca: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  nomeBusca: { fontSize: 16, fontWeight: '600', color: '#333' },
  servicoBusca: { fontSize: 13, color: '#8e8e8e' },
  vazio: { textAlign: 'center', marginTop: 30, color: '#8e8e8e' }
});