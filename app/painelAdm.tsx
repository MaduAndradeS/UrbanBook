import { router, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import logo from '../assets/images/logo.png';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const handleLogout = () => {
    Alert.alert('Sair', 'Deseja terminar sessão?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await AsyncStorage.clear(); router.replace('/'); } },
    ]);
  };

const ID_ADM_FIXO = 1;

type Empresario = {
  ID_EMPRESARIO: number;
  NOME: string;
  CNPJ: string;
  BIO?: string | null;
  EMAIL: string;
  ID_ADM: number | null;
  ENDERECO?: {
    RUA: string;
    NUM: number | null;
    BAIRRO: string;
    CIDADE: string;
    ESTADO: string;
    CEP: string;
    COMP?: string | null;
  }[];
  TELEFONE?: {
    TELEFONE: string;
  }[];
  SERVICOS?: {
    NOME: string;
  }[];
};

export default function PainelAdm() {
  const router = useRouter();
  const [pendentes, setPendentes] = useState<Empresario[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [aprovandoId, setAprovandoId] = useState<number | null>(null);

  async function carregarPendentes() {
    try {
      setCarregando(true);

      const response = await fetch(`${API_URL}/empresarios/pendentes`);
      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Não foi possível carregar os pendentes.');
        return;
      }

      setPendentes(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  }

  async function aprovarEmpresario(idEmpresario: number) {
    try {
      setAprovandoId(idEmpresario);

      const response = await fetch(
        `${API_URL}/empresarios/${idEmpresario}/aprovar`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idAdm: ID_ADM_FIXO,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Não foi possível aprovar o empresário.');
        return;
      }

      Alert.alert('Sucesso', 'Empresário aprovado com sucesso!');
      await carregarPendentes();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setAprovandoId(null);
    }
  }

  useEffect(() => {
    carregarPendentes();
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.top}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.title}>Urban Book</Text>
          <Text style={styles.subtitle}>Painel administrativo</Text>
        </View>

        <View style={styles.bottom}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Empresários pendentes</Text>

            <TouchableOpacity style={styles.refreshButton} onPress={carregarPendentes}>
              <Text style={styles.refreshButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {carregando ? (
              <Text style={styles.infoText}>Carregando pendentes...</Text>
            ) : pendentes.length === 0 ? (
              <Text style={styles.infoText}>Nenhum empresário pendente no momento.</Text>
            ) : (
              pendentes.map((empresario) => {
                const endereco = empresario.ENDERECO?.[0];
                const telefone = empresario.TELEFONE?.[0];
                const servicos = empresario.SERVICOS?.map((s) => s.NOME).join(', ');

                return (
                  <View key={empresario.ID_EMPRESARIO} style={styles.card}>
                    <Text style={styles.cardTitle}>{empresario.NOME}</Text>

                    <Text style={styles.cardText}>CNPJ: {empresario.CNPJ}</Text>
                    <Text style={styles.cardText}>E-mail: {empresario.EMAIL}</Text>

                    {empresario.BIO ? (
                      <Text style={styles.cardText}>Bio: {empresario.BIO}</Text>
                    ) : null}

                    {telefone ? (
                      <Text style={styles.cardText}>Telefone: {telefone.TELEFONE}</Text>
                    ) : null}

                    {endereco ? (
                      <Text style={styles.cardText}>
                        Endereço: {endereco.RUA}, {endereco.NUM ?? 's/n'} - {endereco.BAIRRO},{' '}
                        {endereco.CIDADE}/{endereco.ESTADO}
                      </Text>
                    ) : null}

                    {servicos ? (
                      <Text style={styles.cardText}>Serviços: {servicos}</Text>
                    ) : null}

                    <TouchableOpacity
                      style={[
                        styles.approveButton,
                        aprovandoId === empresario.ID_EMPRESARIO && styles.approveButtonDisabled,
                      ]}
                      onPress={() => aprovarEmpresario(empresario.ID_EMPRESARIO)}
                      disabled={aprovandoId === empresario.ID_EMPRESARIO}
                    >
                      <Text style={styles.approveButtonText}>
                        {aprovandoId === empresario.ID_EMPRESARIO ? 'Aprovando...' : 'Aprovar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  top: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  logo: {
    marginTop: 60,
    width: 125,
    height: 125,
    marginBottom: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },

  subtitle: {
    textAlign: 'center',
    marginTop: 5,
  },

  bottom: {
    flex: 2,
    backgroundColor: '#67C5C0',
    padding: 25,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 0,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },

  refreshButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  refreshButtonText: {
    fontWeight: 'bold',
  },

  infoText: {
    color: '#000',
    marginTop: 10,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },

  cardText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
  },

  approveButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  approveButtonDisabled: {
    opacity: 0.7,
  },

  approveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  logoutButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  logoutButtonText: {
    fontWeight: 'bold',
  },
});