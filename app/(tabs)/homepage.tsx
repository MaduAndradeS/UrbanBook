import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type EmpresarioApi = {
  ID_EMPRESARIO: number;
  NOME: string;
  FOTO_PERFIL: string | null;
  ENDERECO?: Array<{
    RUA?: string;
    NUM?: number | null;
    BAIRRO?: string;
    CIDADE?: string;
    ESTADO?: string;
    CEP?: string;
    COMP?: string | null;
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
};

function pegarIniciais(nome: string) {
  if (!nome) return '?';

  const partes = nome
    .trim()
    .split(' ')
    .filter(Boolean);

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

type AvatarPerfilProps = {
  nome: string;
  fotoPerfil: string | null;
  tamanho?: number;
};

function AvatarPerfil({ nome, fotoPerfil, tamanho = 60 }: AvatarPerfilProps) {
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

  /*
    Ajuste temporariamente conforme o login real
  */
  const tipoUsuario: 'cliente' | 'empresario' = 'cliente';
  const idEmpresarioLogado: number | null = null;

  const API_URL = 'http://192.168.0.101:3333/api/empresarios';

  useEffect(() => {
    buscarEmpresarios();
  }, []);

  async function buscarEmpresarios(modoRefresh = false) {
    try {
      if (modoRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErro('');

      const response = await fetch(API_URL);
      const json: EmpresarioApi[] = await response.json();

      if (!response.ok) {
        throw new Error('Erro ao carregar empresas');
      }

      const formatados: CardItem[] = (json || []).map((item) => {
        const enderecoObj =
          item.ENDERECO && item.ENDERECO.length > 0
            ? item.ENDERECO[0]
            : undefined;

          const endereco = enderecoObj
            ? [
          [
            enderecoObj.RUA,
            enderecoObj.NUM ? String(enderecoObj.NUM) : null
          ]
            .filter(Boolean)
            .join(', '),
          [
            enderecoObj.BAIRRO,
            enderecoObj.CIDADE
          ]
            .filter(Boolean)
            .join(', '),
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
          imgPerfil: item.FOTO_PERFIL || null
        };
      });

      setDados(formatados);
    } catch (error: any) {
      setErro(error?.message || 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function abrirPerfilEmpresa(item: CardItem) {
    const idClicado = Number(item.id);

    const clicouNaPropriaEmpresa =
      tipoUsuario === 'empresario' &&
      idEmpresarioLogado !== null &&
      idEmpresarioLogado === idClicado;

    if (clicouNaPropriaEmpresa) {
      router.push('/perfil-empresa');
      return;
    }

    router.push({
      pathname: '/perfil-empresa-cliente',
      params: { id: item.id }
    });
  }

  const conteudo = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.estadoContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.estadoTexto}>Carregando empresas...</Text>
        </View>
      );
    }

    if (erro) {
      return (
        <View style={styles.estadoContainer}>
          <Text style={styles.estadoErro}>{erro}</Text>
          <TouchableOpacity
            style={styles.botaoRecarregar}
            onPress={() => buscarEmpresarios()}
          >
            <Text style={styles.botaoRecarregarTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (dados.length === 0) {
      return (
        <View style={styles.estadoContainer}>
          <Text style={styles.estadoTexto}>Nenhuma empresa encontrada.</Text>
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
              <AvatarPerfil
                nome={item.nome}
                fotoPerfil={item.imgPerfil}
                tamanho={60}
              />

              <View style={styles.info}>
                <Text style={styles.nome}>{item.nome}</Text>

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
            onRefresh={() => buscarEmpresarios(true)}
          />
        }
      >
        <View style={styles.localizacaoContainer}>
          <View style={styles.localizacao}>
            <Ionicons name="location-outline" size={22} color="#000" />
            <Text style={styles.textLocalizacao}>Localização atual</Text>
          </View>
        </View>

        {conteudo}
      </ScrollView>
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
    justifyContent: 'center'
  },

  textLocalizacao: {
    marginLeft: 5,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
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
  }
});