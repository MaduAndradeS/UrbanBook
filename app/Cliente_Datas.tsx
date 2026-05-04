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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../config/api';

const MAPA_DIAS: Record<number, string> = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sab' };
const MAPA_DIAS_REV: Record<string, number> = { 'Dom': 0, 'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sab': 6 };

export default function Cliente_Datas() {
  const params = useLocalSearchParams();
  const idEmpresario = params.id;

  const [loading, setLoading] = useState(true);
  const [configList, setConfigList] = useState<any[]>([]);
  const [diasHabilitadosCalendario, setDiasHabilitadosCalendario] = useState<string[]>([]);
  
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [ocupados, setOcupados] = useState<string[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [nomeProfissional, setNomeProfissional] = useState('Profissional');

  useEffect(() => {
    fetchConfig();
    fetchPerfil();
  }, [idEmpresario]);

  useEffect(() => {
    if (diaSelecionado && configList.length > 0) {
      gerarGradeHorarios();
      buscarOcupados();
    }
  }, [diaSelecionado]);

  async function fetchPerfil() {
    const idReal = idEmpresario;
    if (!idReal) return;
    try {
      const res = await fetch(`${API_URL}/empresarios/${idReal}`);
      if (res.ok) {
        const data = await res.json();
        if (data.NOME) setNomeProfissional(data.NOME);
      }
    } catch (e) { console.log(e) }
  }

  async function fetchConfig() {
    const idReal = idEmpresario; 
    if (!idReal) {
       setLoading(false);
       return;
    }

    try {
      const response = await fetch(`${API_URL}/empresarios/${idReal}/disponibilidade`);
      if (!response.ok) {
        setConfigList([]);
        return;
      }

      const dataAgenda = await response.json();
      let listaAgendas: any[] = [];
      if (Array.isArray(dataAgenda)) {
        listaAgendas = dataAgenda;
      } else if (dataAgenda && dataAgenda.disponibilidade) {
        listaAgendas = dataAgenda.disponibilidade;
      } else if (dataAgenda && dataAgenda.ID_DISP) {
        listaAgendas = [dataAgenda]; 
      }

      setConfigList(listaAgendas);

      if (listaAgendas.length > 0) {
        let datasCalculadas: string[] = [];
        listaAgendas.forEach((item: any) => {
           if (item.DIAS_ATIVOS) {
               const dates = item.DIAS_ATIVOS.split(',').map((d: string) => d.trim());
               datasCalculadas.push(...dates);
           }
        });
        setDiasHabilitadosCalendario(datasCalculadas);
      }
    } catch (error) {
      setConfigList([]);
    } finally {
      setLoading(false);
    }
  }

  async function buscarOcupados() {
    try {
      const response = await fetch(`${API_URL}/agendamentos/check?id=${idEmpresario}&data=${diaSelecionado}`);
      let listaOcupados: string[] = [];
      if (response.ok) {
        const data = await response.json();
        listaOcupados = data.horasOcupadas || [];
      }

      // CORREÇÃO: LÊ A HORA DE BLOQUEIO SEJA COM A DATA COMPLETA OU SÓ A HORA REDUZIDA
      if (configList.length > 0) {
         configList.forEach(conf => {
            if (conf.BLOQUEIO_DISPONIBILIDADE) {
               conf.BLOQUEIO_DISPONIBILIDADE.forEach((b: any) => {
                  if (b.HORA_INICIO) {
                     const dbHora = String(b.HORA_INICIO);
                     
                     if (dbHora.includes('T')) {
                        // Se for o formato antigo longo (ex: 2026-05-21T15:30)
                        if (dbHora.startsWith(diaSelecionado!)) {
                           listaOcupados.push(dbHora.split('T')[1]);
                        }
                     } else {
                        // Se for o formato novo reduzido (ex: 15:30), bloqueia sempre
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

  async function confirmarAgendamento() {
    if (!diaSelecionado || !horaSelecionada) {
      Alert.alert("Erro", "Selecione dia e horário!");
      return;
    }

    try {
      const idClienteLogado = await AsyncStorage.getItem('id_usuario');
      if (!idClienteLogado) {
         Alert.alert("Erro", "Você precisa estar logado para agendar.");
         return;
      }

      const isoDate = new Date(`${diaSelecionado}T${horaSelecionada}:00-03:00`).toISOString();

      const response = await fetch(`${API_URL}/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ID_CLIENTE: Number(idClienteLogado), 
          ID_EMPRESARIO: Number(idEmpresario),
          DATA_HORA: isoDate
        })
      });

      if (response.ok) {
        setModalVisible(false);
        setSucesso(true);
        buscarOcupados(); 
      } else {
        Alert.alert("Erro", "O servidor recusou a gravação do agendamento.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível falar com o servidor.");
    }
  }

  function gerarGradeHorarios() {
    if (!diaSelecionado || configList.length === 0) return;

    const configDoDia = configList.find((item) => {
        if (!item.DIAS_ATIVOS) return false;
        const dates = item.DIAS_ATIVOS.split(',').map((d: string) => d.trim());
        const dateObj = new Date(`${diaSelecionado}T12:00:00Z`);
        const diaDaSemana = MAPA_DIAS[dateObj.getUTCDay()];
        return dates.includes(diaSelecionado!) || dates.includes(diaDaSemana);
    });

    if (!configDoDia || !configDoDia.PERIODOS) {
      setHorariosDisponiveis([]);
      return;
    }

    const lista: string[] = [];
    const duracao = configDoDia.DURACAO_MIN || 30;
    const periodosLimpos = configDoDia.PERIODOS.replace(' às ', '-').split(',');

    periodosLimpos.forEach((p: string) => {
      const partes = p.split('-');
      if(partes.length !== 2) return;
      
      const inicio = partes[0].trim();
      const fim = partes[1].trim();
      
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
  const hoje = new Date();

  diasHabilitadosCalendario.forEach((dataOuDia: string) => {
    if (dataOuDia.includes('-')) {
       marked[dataOuDia] = { marked: true, dotColor: '#67C5C0' };
    } else if (MAPA_DIAS_REV[dataOuDia] !== undefined) {
       const diaAlvo = MAPA_DIAS_REV[dataOuDia];
       for(let i=0; i<60; i++) {
          const tempDate = new Date(hoje);
          tempDate.setDate(hoje.getDate() + i);
          if (tempDate.getDay() === diaAlvo) {
             const isoStr = tempDate.toISOString().split('T')[0];
             marked[isoStr] = { marked: true, dotColor: '#67C5C0' };
          }
       }
    }
  });

  if (diaSelecionado) {
    marked[diaSelecionado] = { ...marked[diaSelecionado], selected: true, selectedColor: '#000' };
  }

  if (loading) {
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
          <Text style={styles.nome}>{nomeProfissional}</Text>
          <Text style={styles.subNome}>Profissional Verificado</Text>
        </View>
      </View>

      <Text style={styles.titulo}>Selecione uma data</Text>

      <Calendar
        minDate={new Date().toISOString().split('T')[0]}
        markedDates={marked}
        onDayPress={(day: any) => {
          const dataClicada = day.dateString;
          const dateObj = new Date(`${dataClicada}T12:00:00Z`);
          const diaDaSemana = MAPA_DIAS[dateObj.getUTCDay()];

          if (diasHabilitadosCalendario.includes(dataClicada) || diasHabilitadosCalendario.includes(diaDaSemana)) {
            setDiaSelecionado(dataClicada);
            setHoraSelecionada(null);
          } else {
            Alert.alert("Indisponível", "Este profissional não atende nesta data.");
          }
        }}
        theme={{ todayTextColor: '#67C5C0', selectedDayBackgroundColor: '#000', arrowColor: '#67C5C0' }}
      />

      {diaSelecionado && (
        <>
          <Text style={styles.titulo}>Horários para {diaSelecionado.split('-').reverse().join('/')}</Text>

          <View style={styles.gridHorarios}>
            {horariosDisponiveis.length > 0 ? (
              horariosDisponiveis.map((hora) => {
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
                    <Text style={{ color: isOcupado ? '#CCC' : '#FFF', fontWeight: 'bold' }}>{hora}</Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={{ color: '#999' }}>Nenhum horário cadastrado para este dia.</Text>
            )}
          </View>
        </>
      )}

      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirmar Agendamento?</Text>
            <Text style={styles.modalInfo}>Data: {diaSelecionado?.split('-').reverse().join('/')}</Text>
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
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  perfil: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, marginTop: 10 },
  nome: { fontSize: 20, fontWeight: 'bold' },
  subNome: { fontSize: 14, color: '#666' },
  titulo: { fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
  gridHorarios: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 },
  cardHorario: { paddingVertical: 12, paddingHorizontal: 15, borderRadius: 10, minWidth: 85, alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#FFF', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalInfo: { fontSize: 16, marginBottom: 5, color: '#444' },
  areaBotoes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  btnVoltar: { backgroundColor: '#EEE', padding: 15, borderRadius: 12, width: '45%', alignItems: 'center' },
  btnConfirmar: { backgroundColor: '#67C5C0', padding: 15, borderRadius: 12, width: '45%', alignItems: 'center' }
});