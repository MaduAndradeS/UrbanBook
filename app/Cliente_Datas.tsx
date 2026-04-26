import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { API_URL } from '../config/api';

export default function Cliente_Datas() {
  const params = useLocalSearchParams();
  const idEmpresario = params.id;

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [ocupados, setOcupados] = useState<string[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [idEmpresario]);

  useEffect(() => {
    if (diaSelecionado && config) {
      gerarGradeHorarios();
      buscarOcupados();
    }
  }, [diaSelecionado]);

  async function fetchConfig() {
    const idReal = idEmpresario || 1;
    try {
      const response = await fetch(`${API_URL}/empresarios/${idReal}/disponibilidade`);
      
      if (!response.ok) {
        setConfig({ DIAS_ATIVOS: "", PERIODOS: "" });
        return;
      }

      const data = await response.json();
      const dias = data.DIAS_ATIVOS || data.dias_ativos;
      const periodos = data.PERIODOS || data.periodos;

      if (dias) {
        setConfig({
          ...data,
          DIAS_ATIVOS: dias.toString().replace(/\s+/g, ''),
          PERIODOS: periodos
        });
      } else {
        setConfig(data);
      }
    } catch (error) {
      setConfig({ DIAS_ATIVOS: "", PERIODOS: "" });
    } finally {
      setLoading(false);
    }
  }

  async function buscarOcupados() {
    try {
      const response = await fetch(`${API_URL}/agendamentos/check?id=${idEmpresario || 1}&data=${diaSelecionado}`);
      const data = await response.json();
      setOcupados(data.horasOcupadas || []);
    } catch (e) {
      setOcupados([]);
    }
  }

  async function confirmarAgendamento() {
    const idParaAgendar = idEmpresario || "1";

    if (!diaSelecionado || !horaSelecionada) {
      Alert.alert("Erro", "Selecione dia e horário!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ID_CLIENTE: 1, 
          ID_EMPRESARIO: Number(idParaAgendar),
          DATA_HORA: `${diaSelecionado}T${horaSelecionada}:00`
        })
      });

      if (response.ok) {
        setModalVisible(false);
        setSucesso(true);
        buscarOcupados();
      } else {
        Alert.alert("Erro", "Erro ao processar agendamento.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível falar com o servidor.");
    }
  }

  function gerarGradeHorarios() {
    if (!config?.PERIODOS) return;

    const lista: string[] = [];
    const duracao = config.DURACAO_MIN || 30;
    const periodos = config.PERIODOS.split(',');

    periodos.forEach((p: string) => {
      const [inicio, fim] = p.split('-');
      let atual = timeToMin(inicio);
      const limite = timeToMin(fim);

      while (atual + duracao <= limite) {
        lista.push(minToTime(atual));
        atual += duracao;
      }
    });
    setHorariosDisponiveis(lista);
  }

  const timeToMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const minToTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const marked: any = {};
  if (config?.DIAS_ATIVOS) {
    config.DIAS_ATIVOS.split(',').forEach((data: string) => {
      marked[data] = { marked: true, dotColor: '#67C5C0' };
    });
  }

  if (diaSelecionado) {
    marked[diaSelecionado] = {
      ...marked[diaSelecionado],
      selected: true,
      selectedColor: '#000'
    };
  }

  if (loading || !config) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#67C5C0" />
        <Text style={{ marginTop: 10 }}>Carregando agenda...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.perfil}>
        <Ionicons name="person-circle" size={60} color="#ccc" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.nome}>{params.nome || 'Profissional'}</Text>
          <Text style={styles.subNome}>Campinas - SP</Text>
        </View>
      </View>

      <Text style={styles.titulo}>Selecione uma data</Text>

      <Calendar
        minDate={new Date().toISOString().split('T')[0]}
        markedDates={marked}
        onDayPress={(day) => {
          const dataClicada = day.dateString;
          const listaDiasLiberados = config?.DIAS_ATIVOS ? config.DIAS_ATIVOS.split(',') : [];

          if (listaDiasLiberados.includes(dataClicada)) {
            setDiaSelecionado(dataClicada);
            setHoraSelecionada(null);
          } else {
            Alert.alert("Indisponível", "Este profissional não atende nesta data.");
          }
        }}
        theme={{
          todayTextColor: '#67C5C0',
          selectedDayBackgroundColor: '#000',
          arrowColor: '#67C5C0',
        }}
      />

      <Text style={styles.titulo}>Horários para {diaSelecionado || '...'}</Text>

      <View style={styles.gridHorarios}>
        {horariosDisponiveis.map((hora) => {
          const isOcupado = ocupados.includes(hora);
          return (
            <TouchableOpacity
              key={hora}
              disabled={isOcupado}
              onPress={() => {
                setHoraSelecionada(hora);
                setModalVisible(true);
              }}
              style={[
                styles.cardHorario,
                { backgroundColor: isOcupado ? '#F0F0F0' : (horaSelecionada === hora ? '#000' : '#67C5C0') }
              ]}
            >
              <Text style={{ color: isOcupado ? '#CCC' : '#FFF', fontWeight: 'bold' }}>
                {hora}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirmar Agendamento?</Text>
            <Text style={styles.modalInfo}>Data: {diaSelecionado}</Text>
            <Text style={styles.modalInfo}>Horário: {horaSelecionada}</Text>
            <View style={styles.areaBotoes}>
              <TouchableOpacity style={styles.btnVoltar} onPress={() => setModalVisible(false)}>
                <Text>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirmar} onPress={confirmarAgendamento}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={sucesso} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Ionicons name="checkmark-circle" size={50} color="#67C5C0" style={{ alignSelf: 'center' }} />
            <Text style={[styles.modalTitle, { textAlign: 'center', marginTop: 10 }]}>Tudo certo!</Text>
            <TouchableOpacity style={[styles.btnConfirmar, { width: '100%', marginTop: 20 }]} onPress={() => setSucesso(false)}>
              <Text style={{ color: '#FFF' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  subNome: {
    fontSize: 14,
    color: '#666'
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15
  },
  gridHorarios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 40
  },
  cardHorario: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    minWidth: 85,
    alignItems: 'center'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  modalInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444'
  },
  areaBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25
  },
  btnVoltar: {
    backgroundColor: '#EEE',
    padding: 15,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center'
  },
  btnConfirmar: {
    backgroundColor: '#67C5C0',
    padding: 15,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center'
  }
});