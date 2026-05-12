import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

// =========================
// CONFIGURAÇÃO PT-BR
// =========================
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ],
  monthNamesShort: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ],
  dayNames: [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
};

LocaleConfig.defaultLocale = 'pt-br';

const { width } = Dimensions.get('window');

export default function Cliente_Datas() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const idEmpresario = params.id;

  const [loading, setLoading] = useState(true);
  const [configList, setConfigList] = useState<any[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [ocupados, setOcupados] = useState<string[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [perfil, setPerfil] = useState({
    nome: 'Carregando...',
    foto: null as string | null,
    categoria: 'Profissional',
  });

  // =========================
  // LOAD INICIAL
  // =========================
  useEffect(() => {
    if (idEmpresario) {
      fetchPerfil();
      fetchConfig();
    }
  }, [idEmpresario]);

  useEffect(() => {
    if (diaSelecionado && configList.length > 0) {
      gerarGradeHorarios();
      buscarOcupados();
    }
  }, [diaSelecionado, configList]);

  // =========================
  // CALENDÁRIO
  // =========================
  const markedDates = useMemo(() => {
    const marked: any = {};

    configList.forEach((config) => {
      if (!config.DIAS_ATIVOS) return;

      const itens = config.DIAS_ATIVOS.split(',').map((s: string) =>
        s.trim()
      );

      itens.forEach((item: string) => {
        if (item.length === 10 && item.includes('-')) {
          marked[item] = {
            marked: true,
            dotColor: '#67C5C0',
          };
        }
      });
    });

    if (diaSelecionado) {
      marked[diaSelecionado] = {
        ...marked[diaSelecionado],
        selected: true,
        selectedColor: '#67C5C0',
      };
    }

    return marked;
  }, [configList, diaSelecionado]);

  // =========================
  // PERFIL
  // =========================
  async function fetchPerfil() {
    try {
      const res = await fetch(`${API_URL}/empresarios/${idEmpresario}`);

      if (res.ok) {
        const data = await res.json();

        setPerfil({
          nome: data.NOME || 'Profissional',
          foto: data.FOTO_PERFIL || null,
          categoria: data.BIO || 'Profissional Verificado',
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  // =========================
  // CONFIGURAÇÃO
  // =========================
  async function fetchConfig() {
    try {
      const response = await fetch(
        `${API_URL}/empresarios/${idEmpresario}/disponibilidade`
      );

      const data = await response.json();

      const lista = Array.isArray(data)
        ? data
        : data.disponibilidade || [data];

      setConfigList(lista);
    } catch (error) {
      console.log('Erro ao carregar disponibilidade:', error);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // ENCONTRAR CONFIG DO DIA
  // =========================
  function encontrarConfigDoDia() {
    if (!diaSelecionado || configList.length === 0) return null;

    for (const config of configList) {
      if (!config.DIAS_ATIVOS) continue;

      const itens = config.DIAS_ATIVOS
        .split(',')
        .map((s: string) => s.trim());

      if (itens.includes(diaSelecionado)) {
        return config;
      }

      const data = new Date(`${diaSelecionado}T12:00:00`);

      const diasSemana: Record<number, string> = {
        0: 'Dom',
        1: 'Seg',
        2: 'Ter',
        3: 'Qua',
        4: 'Qui',
        5: 'Sex',
        6: 'Sab',
      };

      const diaSemana = diasSemana[data.getDay()];

      if (itens.includes(diaSemana)) {
        return config;
      }
    }

    return null;
  }

  // =========================
  // BUSCAR HORÁRIOS OCUPADOS
  // =========================
  async function buscarOcupados() {
    try {
      const response = await fetch(
        `${API_URL}/agendamentos/check?id=${idEmpresario}&data=${diaSelecionado}`
      );

      let listaOcupados: string[] = [];

      if (response.ok) {
        const data = await response.json();
        listaOcupados = data.horasOcupadas || [];
      }

      if (configList.length > 0) {
        configList.forEach((conf) => {
          if (conf.BLOQUEIO_DISPONIBILIDADE) {
            conf.BLOQUEIO_DISPONIBILIDADE.forEach((b: any) => {
              if (b.HORA_INICIO) {
                const dbHora = String(b.HORA_INICIO);

                if (dbHora.includes('T')) {
                  if (dbHora.startsWith(diaSelecionado!)) {
                    listaOcupados.push(dbHora.split('T')[1]);
                  }
                } else {
                  listaOcupados.push(dbHora);
                }
              }
            });
          }
        });
      }

      setOcupados(listaOcupados);
    } catch (e) {
      setOcupados([]);
    }
  }

  // =========================
  // FUNÇÕES DE TEMPO
  // =========================
  const timeToMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const minToTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(
      2,
      '0'
    )}`;
  };

  // =========================
  // GERAR HORÁRIOS
  // =========================
  function gerarGradeHorarios() {
    const config = encontrarConfigDoDia();

    if (!config || !config.PERIODOS) {
      setHorariosDisponiveis([]);
      return;
    }

    const slots: string[] = [];
    const duracao = Number(config.DURACAO_MIN) || 30;

    config.PERIODOS.split(',')
      .map((s: string) => s.trim())
      .forEach((p: string) => {
        const [ini, fim] = p.split('-').map((s) => s.trim());

        if (!ini || !fim) return;

        let atual = timeToMin(ini);
        const limite = timeToMin(fim);

        while (atual + duracao <= limite) {
          slots.push(minToTime(atual));
          atual += duracao;
        }
      });

    setHorariosDisponiveis(slots);
  }

  // =========================
  // CONFIRMAR AGENDAMENTO
  // =========================
  async function confirmarAgendamento() {
    if (!diaSelecionado || !horaSelecionada) {
      Alert.alert('Erro', 'Selecione dia e horário!');
      return;
    }

    try {
      const idClienteLogado = await AsyncStorage.getItem('id_usuario');

      if (!idClienteLogado) {
        Alert.alert(
          'Erro',
          'Você precisa estar logado para agendar.'
        );
        return;
      }

      const isoDate = new Date(
        `${diaSelecionado}T${horaSelecionada}:00-03:00`
      ).toISOString();

      const response = await fetch(`${API_URL}/agendamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ID_CLIENTE: Number(idClienteLogado),
          ID_EMPRESARIO: Number(idEmpresario),
          DATA_HORA: isoDate,
        }),
      });

      if (response.ok) {
        setModalVisible(false);
        setSucesso(true);

        setOcupados((prev) => [...prev, horaSelecionada]);

        buscarOcupados();
      } else {
        Alert.alert(
          'Erro',
          'O servidor recusou a gravação do agendamento.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível falar com o servidor.'
      );
    }
  }

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator
          size="large"
          color="#67C5C0"
        />
      </View>
    );
  }

  // =========================
  // RENDER
  // =========================
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.perfilCentralizado}>
          {perfil.foto ? (
            <Image
              source={{ uri: perfil.foto }}
              style={styles.fotoPerfilGrande}
            />
          ) : (
            <View style={styles.fotoPerfilGrande}>
              <Text style={styles.avatarLetraGrande}>
                {perfil.nome.charAt(0)}
              </Text>
            </View>
          )}

          <Text style={styles.nomeGrande}>
            {perfil.nome}
          </Text>

          <Text style={styles.subNomeGrande}>
            {perfil.categoria}
          </Text>
        </View>
      </View>

      <Text style={styles.tituloSecao}>
        Selecione uma data
      </Text>

      <View style={styles.cardCalendario}>
        <Calendar
          minDate={new Date().toISOString().split('T')[0]}
          onDayPress={(day: any) => {
            setDiaSelecionado(day.dateString);
            setHoraSelecionada(null);
          }}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#67C5C0',
            selectedDayBackgroundColor: '#67C5C0',
            arrowColor: '#67C5C0',
          }}
        />
      </View>

      {diaSelecionado && (
        <View style={{ paddingBottom: 50 }}>
          <Text style={styles.tituloSecao}>
            Horários em{' '}
            {diaSelecionado
              .split('-')
              .reverse()
              .join('/')}
          </Text>

          <View style={styles.gridHorarios}>
            {horariosDisponiveis.length > 0 ? (
              horariosDisponiveis.map((h) => {
                const isOcupado =
                  ocupados.includes(h);

                const isSelected =
                  horaSelecionada === h;

                return (
                  <TouchableOpacity
                    key={h}
                    disabled={isOcupado}
                    onPress={() => {
                      setHoraSelecionada(h);
                      setModalVisible(true);
                    }}
                    style={[
                      styles.cardHora,
                      isOcupado &&
                        styles.cardOcupado,
                      isSelected &&
                        styles.cardSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.textHora,
                        isOcupado &&
                          styles.textOcupado,
                        isSelected &&
                          styles.textSelected,
                      ]}
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.semAtendimento}>
                Este profissional não atende
                nesta data.
              </Text>
            )}
          </View>
        </View>
      )}

      {/* MODAL CONFIRMAÇÃO */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
      >
        <View style={styles.overlay}>
          <View style={styles.modalConfirm}>
            <Text style={styles.modalTitle}>
              Confirmar Reserva
            </Text>

            <View style={styles.infoAgendamento}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#67C5C0"
                />
                <Text style={styles.infoText}>
                  {diaSelecionado
                    ?.split('-')
                    .reverse()
                    .join('/')}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#67C5C0"
                />
                <Text style={styles.infoText}>
                  {horaSelecionada}h
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() =>
                  setModalVisible(false)
                }
              >
                <Text
                  style={{
                    color: '#888',
                  }}
                >
                  Voltar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnConfirmar}
                onPress={
                  confirmarAgendamento
                }
              >
                <Text
                  style={{
                    color: '#FFF',
                    fontWeight: 'bold',
                  }}
                >
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL SUCESSO */}
      <Modal
        transparent
        visible={sucesso}
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={styles.modalSucesso}>
            <View style={styles.checkIcon}>
              <Ionicons
                name="checkmark"
                size={40}
                color="#FFF"
              />
            </View>

            <Text style={styles.sucessoTitle}>
              Tudo pronto!
            </Text>

            <Text style={styles.sucessoSub}>
              Seu horário foi agendado com
              sucesso.
            </Text>

            <TouchableOpacity
              style={styles.btnOk}
              onPress={() =>
                setSucesso(false)
              }
            >
              <Text
                style={{
                  color: '#FFF',
                  fontWeight: 'bold',
                }}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center',
  },

  perfilCentralizado: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  fotoPerfilGrande: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#67C5C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#F0F0F0',
  },

  avatarLetraGrande: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: 'bold',
  },

  nomeGrande: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  subNomeGrande: {
    fontSize: 15,
    color: '#67C5C0',
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  },

  tituloSecao: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555',
    marginLeft: 20,
    marginTop: 25,
    marginBottom: 15,
  },

  cardCalendario: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 10,
  },

  gridHorarios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 10,
  },

  cardHora: {
    width: (width - 60) / 3,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },

  cardOcupado: {
    backgroundColor: '#F2F2F2',
    opacity: 0.6,
  },

  cardSelected: {
    backgroundColor: '#67C5C0',
  },

  textHora: {
    fontWeight: '600',
    color: '#444',
  },

  textOcupado: {
    color: '#CCC',
  },

  textSelected: {
    color: '#FFF',
  },

  semAtendimento: {
    marginLeft: 20,
    color: '#999',
    fontStyle: 'italic',
  },

  overlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalConfirm: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },

  infoAgendamento: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 5,
  },

  infoText: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  btnCancelar: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },

  btnConfirmar: {
    flex: 1,
    backgroundColor: '#67C5C0',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  modalSucesso: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
  },

  checkIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#67C5C0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sucessoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },

  sucessoSub: {
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 25,
  },

  btnOk: {
    backgroundColor: '#333',
    width: '100%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
});