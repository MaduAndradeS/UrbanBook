import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const largura = Dimensions.get('window').width;
const CARD_WIDTH = (largura - 30) / 2;

// --- TIPAGEM BASEADA NO SEU SCHEMA.PRISMA ---
interface Servico {
  ID_SERVICO: number;
  NOME: string;
  ID_EMPRESARIO: number | null;
}

interface Empresario {
  ID_EMPRESARIO: number;
  NOME: string;
  CNPJ: string;
  BIO: string | null;
  EMAIL: string;
  SERVICOS: Servico[];
}

export default function PesquisaCliente() {
  const router = useRouter();
  
  // Estados tipados
  const [empresarios, setEmpresarios] = useState<Empresario[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');

  // Função de busca integrada ao seu backend (server.js + pg_pesquisa.js)
  const buscarEmpresarios = async (texto: string = '') => {
    try {
      setCarregando(true);
      // Nota: Use o IP da sua máquina se estiver testando em dispositivo físico
      const response = await fetch(`http://localhost:3000/empresarios?busca=${texto}`);
      const dadosApi: Empresario[] = await response.json();
      setEmpresarios(dadosApi);
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarEmpresarios();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={empresarios}
        keyExtractor={(item) => item.ID_EMPRESARIO.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        
        ListHeaderComponent={
          <View>

            <View style={styles.barraPesquisa}>
              <Ionicons name="search" size={18} color="#000" />
              <TextInput
                placeholder="Pesquisar..."
                placeholderTextColor="#8e8e8e"
                style={styles.input}
                value={busca}
                onChangeText={setBusca}
                onSubmitEditing={() => buscarEmpresarios(busca)}
              />
              {busca !== '' && (
                <TouchableOpacity onPress={() => { setBusca(''); buscarEmpresarios(''); }}>
                  <Ionicons name="close-circle" size={18} color="#8e8e8e" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.tituloSecao}>
              {busca ? `Resultados para "${busca}"` : "Mais buscados perto de você"}
            </Text>

            {carregando && <ActivityIndicator color="#000" style={{ marginBottom: 20 }} />}
          </View>
        }

        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({
                pathname: '/recomendados',
                params: { id: item.ID_EMPRESARIO.toString(), nome: item.NOME }
            })}
          >
            <Text style={styles.cardTitulo} numberOfLines={1}>{item.NOME}</Text>

            <View style={styles.imagensContainer}>
              <Image 
                source={{ uri: `https://ui-avatars.com/api/?name=${item.NOME}&background=random` }} 
                style={styles.imgMain} 
              />
              {item.SERVICOS && item.SERVICOS.length > 0 && (
                <View style={styles.badgeServico}>
                    <Text style={styles.textBadge}>{item.SERVICOS[0].NOME}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        
        ListEmptyComponent={
          !carregando && empresarios.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: '#8e8e8e' }}>Nenhum profissional encontrado.</Text>
            </View>
          ) : null
        }
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

  barraPesquisa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#efefef',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginHorizontal: 20,
    marginTop: 5
  },
  input: { flex: 1, fontSize: 14, marginLeft: 8, color: '#000' },
  tituloSecao: { fontSize: 15, fontWeight: 'bold', marginLeft: 20, marginTop: 15, marginBottom: 10, color: '#000' },
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
  cardTitulo: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333', textAlign: 'center' },
  imagensContainer: { width: 100, height: 80, justifyContent: 'center', alignItems: 'center' },
  imgMain: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#eee' },
  badgeServico: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#757575',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  textBadge: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});