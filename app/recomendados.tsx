import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { API_URL } from '../config/api';

interface Profissional {
  ID_EMPRESARIO: number;
  NOME: string;
  CIDADE?: string;
  FOTO_PERFIL?: string;
  SERVICOS?: { NOME: string }[];
}

export default function Recomendados() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const categoria = typeof params.categoria === 'string' ? params.categoria : 'Profissionais';

  const [lista, setLista] = useState<Profissional[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregarPorCategoria = async () => {
    try {
      setErro(false);
      setCarregando(true);
      const response = await fetch(`${API_URL}/empresarios?categoria=${encodeURIComponent(categoria)}`);
      
      if (!response.ok) throw new Error('Erro na resposta do servidor');
      
      const dados = await response.json();
      setLista(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar recomendados:", error);
      setErro(true);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPorCategoria();
  }, [categoria]);

  const renderProfissional = ({ item }: { item: Profissional }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: '/perfil-empresa-cliente',
        params: { id: item.ID_EMPRESARIO.toString() }
      })}
    >  
      <Image 
        source={{ uri: item.FOTO_PERFIL || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.NOME)}&background=random&size=128` }} 
        style={styles.avatar} 
      />
      
      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={1}>{item.NOME}</Text>
        <Text style={styles.especialidade}>{categoria}</Text>
        <View style={styles.locContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.cidade}>{item.CIDADE || 'Campinas, SP'}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{categoria}</Text>
      </View>

      {carregando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.textoApoio}>Buscando profissionais...</Text>
        </View>
      ) : erro ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={50} color="red" />
          <Text style={styles.vazio}>Erro ao conectar com o servidor.</Text>
          <TouchableOpacity onPress={carregarPorCategoria} style={styles.botaoRecarregar}>
            <Text style={{ color: '#fff' }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.ID_EMPRESARIO.toString()}
          renderItem={renderProfissional}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={60} color="#ccc" />
              <Text style={styles.vazio}>Nenhum {categoria} disponível no momento.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textTransform: 'capitalize',
    color: '#333'
  },
  list: { padding: 15, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#f9f9f9'
  },
  avatar: { width: 55, height: 55, borderRadius: 27.5, marginRight: 12 },
  info: { flex: 1 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  especialidade: { fontSize: 13, color: '#8e8e8e', marginVertical: 2 },
  locContainer: { flexDirection: 'row', alignItems: 'center' },
  cidade: { fontSize: 12, color: '#666', marginLeft: 3 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  textoApoio: { marginTop: 10, color: '#666' },
  vazio: { textAlign: 'center', color: '#8e8e8e', fontSize: 15, marginTop: 10 },
  botaoRecarregar: { backgroundColor: '#000', padding: 10, borderRadius: 8, marginTop: 15 }
});