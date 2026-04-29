import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EmpresarioApi = {
  ID_EMPRESARIO: number;
  NOME: string;
  FOTO_PERFIL: string | null;
  DISTANCIA_KM?: number;
  ENDERECO?: Array<{
    RUA?: string;
    NUM?: number | null;
    BAIRRO?: string;
    CIDADE?: string;
    ESTADO?: string;
  }>;
  SERVICOS?: Array<{
    NOME: string;
  }>;
};

type CardItem = {
  id: string;
  nome: string;
  categorias: string[];
  endereco: string;
  imgPerfil: string | null;
  distanciaKm?: number;
};

type ResultadoEndereco = {
  endereco: string;
  latitude: number;
  longitude: number;
};

import { API_URL } from '../../config/api';

function pegarIniciais(nome: string) {
  if (!nome) return '?';

  const partes = nome.trim().split(' ').filter(Boolean);

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

function gerarCorPeloNome(nome: string) {
  const cores = [
    '#F28B82',
    '#FBBC04',
    '#34A853',
    '#4285F4',
    '#A142F4',
    '#FF6D01',
    '#00ACC1',
    '#7CB342',
    '#8E24AA',
    '#5E35B1',
    '#EF5350',
    '#26A69A'
  ];

  let soma = 0;
  for (let i = 0; i < nome.length; i++) {
    soma += nome.charCodeAt(i);
  }

  return cores[soma % cores.length];
}

function AvatarPerfil({
  nome,
  fotoPerfil,
  tamanho = 60
}: {
  nome: string;
  fotoPerfil: string | null;
  tamanho?: number;
}) {
  if (fotoPerfil) {
    return (
      <Image
        source={{ uri: fotoPerfil }}
        style={[
          styles.imgPerfil,
          {
            width: tamanho,
            height: tamanho,
            borderRadius: tamanho / 2
          }
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.imgPerfil,
        styles.imgPlaceholder,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
          backgroundColor: gerarCorPeloNome(nome)
        }
      ]}
    >
      <Text style={styles.avatarTexto}>{pegarIniciais(nome)}</Text>
    </View>
  );
}

export default function HomeCliente() {
  const router = useRouter();

  const [dados, setDados] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');

  const [modalLocalizacao, setModalLocalizacao] = useState(false);
  const [textoEndereco, setTextoEndereco] = useState('');
  const [resultadoEndereco, setResultadoEndereco] = useState<ResultadoEndereco[]>([]);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);
  const [localizacaoTexto, setLocalizacaoTexto] = useState('Localização atual');

  // Estados dinâmicos que carregam do AsyncStorage
  const [meuId, setMeuId] = useState<number | null>(null);
  const [meuTipo, setMeuTipo] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDadosIniciais() {
      // 1. Carrega os dados de quem está logado (Regra da Júlia)
      const idSalvo = await AsyncStorage.getItem('id_usuario');
      const tipoSalvo = await AsyncStorage.getItem('tipo_usuario');
      if (idSalvo) setMeuId(Number(idSalvo));
      if (tipoSalvo) setMeuTipo(tipoSalvo);

      // 2. Carrega as empresas ao redor
      carregarEmpresariosProximos();
    }

    carregarDadosIniciais();
  }, []);

  function formatarEmpresarios(json: EmpresarioApi[]): CardItem[] {
    return (json || []).map((item) => {
      const enderecoObj =
        item.ENDERECO && item.ENDERECO.length > 0 ? item.ENDERECO[0] : undefined;

      const endereco = enderecoObj
        ? [
            [[enderecoObj.RUA, enderecoObj.NUM ? String(enderecoObj.NUM) : null]
              .filter(Boolean)
              .join(', ')],
            [enderecoObj.BAIRRO, enderecoObj.CIDADE].filter(Boolean).join(', '),
            enderecoObj.ESTADO
          ]
            .filter(Boolean)
            .join(' - ')
        : 'Endereço não informado';

      return {
        id: String(item.ID_EMPRESARIO),
        nome: item.NOME || 'Empresa sem nome',
        categorias: (item.SERVICOS || []).map((s) => s.NOME),
        endereco,
        imgPerfil: item.FOTO_PERFIL || null,
        distanciaKm: item.DISTANCIA_KM
      };
    });
  }

  async function buscarEmpresariosPorCoordenadas(
    latitude: number,
    longitude: number,
    modoRefresh = false
  ) {
    try {
      if (modoRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErro('');

      const response = await fetch(
        `${API_URL}/empresarios/proximos?lat=${latitude}&lng=${longitude}&raio=10`
      );

      const json: EmpresarioApi[] = await response.json();

      if (!response.ok) {
        throw new Error('Erro ao buscar empresários próximos.');
      }

      setDados(formatarEmpresarios(json));
    } catch (error: any) {
      setErro(error?.message || 'Erro ao buscar empresas próximas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function carregarEmpresariosProximos(modoRefresh = false) {
    try {
      if (modoRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErro('');

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErro('Permissão de localização negada.');
        return;
      }

      const localizacao = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = localizacao.coords;

      setLocalizacaoTexto('Localização atual');

      await buscarEmpresariosPorCoordenadas(latitude, longitude, modoRefresh);
    } catch (error: any) {
      setErro(error?.message || 'Não foi possível buscar sua localização.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function buscarEndereco() {
    if (!textoEndereco.trim()) return;

    try {
      setBuscandoEndereco(true);
      setResultadoEndereco([]);

      const response = await fetch(
        `${API_URL}/localizacao/buscar?endereco=${encodeURIComponent(
          textoEndereco
        )}`
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error('Erro ao buscar endereço.');
      }

      setResultadoEndereco(Array.isArray(json) ? json : [json]);
    } catch (error) {
      console.log('Erro ao buscar endereço:', error);
    } finally {
      setBuscandoEndereco(false);
    }
  }

  async function selecionarEndereco(item: ResultadoEndereco) {
    const partes = item.endereco.split(',').map((p) => p.trim());

    const cidade = partes.find((p) =>
      ['Campinas', 'Valinhos', 'Vinhedo', 'Hortolândia', 'Sumaré'].includes(p)
    );

    const bairroOuRegiao = partes[0];

    const enderecoCurto = cidade
      ? `${bairroOuRegiao}, ${cidade} - SP`
      : partes.slice(0, 2).join(', ');

    setLocalizacaoTexto(enderecoCurto);
    setModalLocalizacao(false);
    setTextoEndereco('');
    setResultadoEndereco([]);

    await buscarEmpresariosPorCoordenadas(item.latitude, item.longitude);
  }

  function abrirPerfilEmpresa(item: CardItem) {
    const idClicado = Number(item.id);

    // Lógica correta de navegação
    const clicouNaPropriaEmpresa =
      meuTipo === 'EMPRESARIO' &&
      meuId !== null &&
      meuId === idClicado;

    if (clicouNaPropriaEmpresa) {
      router.push('/(tabs)/perfil-empresa');
    } else {
      router.push(`/(tabs)/perfil-empresa-cliente?id=${item.id}`);
    }
  }

  const conteudo = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.estadoContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.estadoTexto}>Carregando empresas próximas...</Text>
        </View>
      );
    }

    if (erro) {
      return (
        <View style={styles.estadoContainer}>
          <Text style={styles.estadoErro}>{erro}</Text>
          <TouchableOpacity
            style={styles.botaoRecarregar}
            onPress={() => carregarEmpresariosProximos()}
          >
            <Text style={styles.botaoRecarregarTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (dados.length === 0) {
      return (
        <View style={styles.estadoContainer}>
          <Text style={styles.estadoTexto}>Nenhuma empresa próxima encontrada.</Text>
        </View>
      );
    }

    return (
      <View style={styles.lista}>
        {dados.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => abrirPerfilEmpresa(item)}
          >
            <View style={styles.cardTop}>
              <AvatarPerfil nome={item.nome} fotoPerfil={item.imgPerfil} tamanho={60} />

              <View style={styles.info}>
                <Text style={styles.nome}>{item.nome}</Text>

                {typeof item.distanciaKm === 'number' && (
                  <Text style={styles.distancia}>
                    {item.distanciaKm.toFixed(2)} km de distância
                  </Text>
                )}

                <View style={styles.estrelas}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color="#000" />
                  ))}
                </View>

                <View style={styles.tags}>
                  {item.categorias.length > 0 ? (
                    item.categorias.map((cat, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{cat}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Sem categoria</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <Text style={styles.endereco}>{item.endereco}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [dados, erro, loading]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => carregarEmpresariosProximos(true)}
          />
        }
      >
        <TouchableOpacity
          style={styles.localizacaoContainer}
          onPress={() => setModalLocalizacao(true)}
        >
          <View style={styles.localizacao}>
            <Ionicons name="location-outline" size={22} color="#000" />
            <Text numberOfLines={1} style={styles.textLocalizacao}>
              {localizacaoTexto}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#000" />
          </View>
        </TouchableOpacity>

        {conteudo}
      </ScrollView>

      <Modal
        visible={modalLocalizacao}
        animationType="slide"
        transparent
        onRequestClose={() => setModalLocalizacao(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Escolher localização</Text>

              <TouchableOpacity onPress={() => setModalLocalizacao(false)}>
                <Ionicons name="close" size={26} color="#000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.botaoLocalizacaoAtual}
              onPress={() => {
                setModalLocalizacao(false);
                carregarEmpresariosProximos();
              }}
            >
              <Ionicons name="navigate-outline" size={22} color="#000" />
              <Text style={styles.botaoLocalizacaoAtualTexto}>
                Usar minha localização atual
              </Text>
            </TouchableOpacity>

            <View style={styles.inputEnderecoBox}>
              <Ionicons name="search-outline" size={20} color="#777" />

              <TextInput
                placeholder="Digite rua, bairro ou cidade"
                value={textoEndereco}
                onChangeText={setTextoEndereco}
                onSubmitEditing={buscarEndereco}
                style={styles.inputEndereco}
              />
            </View>

            <TouchableOpacity style={styles.botaoBuscarEndereco} onPress={buscarEndereco}>
              {buscandoEndereco ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botaoBuscarEnderecoTexto}>Buscar endereço</Text>
              )}
            </TouchableOpacity>

            <FlatList
              data={resultadoEndereco}
              keyExtractor={(_, index) => String(index)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemEndereco}
                  onPress={() => selecionarEndereco(item)}
                >
                  <Ionicons name="location-outline" size={22} color="#000" />

                  <View style={styles.itemEnderecoInfo}>
                    <Text style={styles.itemEnderecoTexto}>{item.endereco}</Text>
                    <Text style={styles.itemEnderecoCoordenadas}>
                      Lat: {item.latitude} | Lng: {item.longitude}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !buscandoEndereco && textoEndereco.length > 0 ? (
                  <Text style={styles.semResultadoTexto}>
                    Digite o endereço e toque em buscar.
                  </Text>
                ) : null
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 10
  },
  localizacaoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 10
  },
  localizacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '95%'
  },
  textLocalizacao: {
    marginLeft: 5,
    marginRight: 4,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    maxWidth: 280
  },
  lista: {
    paddingHorizontal: 10
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  imgPerfil: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10
  },
  imgPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarTexto: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700'
  },
  info: {
    flex: 1
  },
  nome: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginBottom: 2
  },
  distancia: {
    fontSize: 12,
    color: '#555',
    marginBottom: 3
  },
  estrelas: {
    flexDirection: 'row',
    marginBottom: 5
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: '#59D6F2',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 5,
    marginBottom: 5
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#fff'
  },
  endereco: {
    marginTop: 8,
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center'
  },
  estadoContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  estadoTexto: {
    marginTop: 10,
    fontSize: 15,
    color: '#333'
  },
  estadoErro: {
    fontSize: 15,
    color: '#b00020',
    textAlign: 'center',
    marginBottom: 12
  },
  botaoRecarregar: {
    backgroundColor: '#59D6F2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  botaoRecarregarTexto: {
    color: '#fff',
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: '68%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  botaoLocalizacaoAtual: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12
  },
  botaoLocalizacaoAtualTexto: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#000'
  },
  inputEnderecoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12
  },
  inputEndereco: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#000'
  },
  botaoBuscarEndereco: {
    backgroundColor: '#000',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  botaoBuscarEnderecoTexto: {
    color: '#fff',
    fontWeight: 'bold'
  },
  itemEndereco: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  itemEnderecoInfo: {
    marginLeft: 10,
    flex: 1
  },
  itemEnderecoTexto: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500'
  },
  itemEnderecoCoordenadas: {
    fontSize: 12,
    color: '#777',
    marginTop: 4
  },
  semResultadoTexto: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
    fontSize: 14
  }
});