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

const MAPA_DIAS_SEMANA: { [key: string]: number } = {
  'Dom': 0, 'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sab': 6
};

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
    const idReal = idEmpresario || 5;
    try {
      const res = await fetch(`${API_URL}/empresarios/${idReal}`);
      if (res.ok) {
        const data = await res.json();
        if (data.NOME) setNomeProfissional(data.NOME);
      }
    } catch (e) { console.log(e) }
  }

  async function fetchConfig() {
    const idReal = idEmpresario || 5; 
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
        const datasCalculadas: string[] = [];
        const diasSemanasAtivos = listaAgendas.map((item: any) => item.DIAS_ATIVOS?.trim());
        const numerosDiasAtivos = diasSemanasAtivos.map((diaExtenso: string) => MAPA_DIAS_SEMANA[diaExtenso]);

        const hoje = new Date();
        for (let i = 0; i < 60; i++) {
          // Cria a data de forma segura ignorando o fuso horário (UTC bug)
          const dataFutura = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
          
          if (numerosDiasAtivos.includes(dataFutura.getDay())) {
            const ano = dataFutura.getFullYear();
            const mes = String(dataFutura.getMonth() + 1).padStart(2, '0');
            const dia = String(dataFutura.getDate()).padStart(2, '0');
            datasCalculadas.push(`${ano}-${mes}-${dia}`);
          }
        }
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
      const response = await fetch(`${API_URL}/agendamentos/check?id=${idEmpresario || 5}&data=${diaSelecionado}`);
      if (response.ok) {
        const data = await response.json();
        setOcupados(data.horasOcupadas || []);
      }
    } catch (e) {
      setOcupados([]);
    }
  }

  async function confirmarAgendamento() {
    const idParaAgendar = idEmpresario || "5";

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
    if (!diaSelecionado || configList.length === 0) return;

    const dataObj = new Date(`${diaSelecionado}T12:00:00Z`); 
    const diaSemanaNumero = dataObj.getUTCDay(); 
    const nomeDiaSemana = Object.keys(MAPA_DIAS_SEMANA).find(key => MAPA_DIAS_SEMANA[key] === diaSemanaNumero);

    const configDoDia = configList.find((item) => item.DIAS_ATIVOS?.trim() === nomeDiaSemana);

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
  diasHabilitadosCalendario.forEach((dataReal: string) => {
    marked[dataReal] = { marked: true, dotColor: '#67C5C0' };
  });

  if (diaSelecionado) {
    marked[diaSelecionado] = {
      ...marked[diaSelecionado],
      selected: true,
      selectedColor: '#000'
    };
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

          if (diasHabilitadosCalendario.includes(dataClicada)) {
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
                    <Text style={{ color: isOcupado ? '#CCC' : '#FFF', fontWeight: 'bold' }}>
                      {hora}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={{ color: '#999' }}>Nenhum horário cadastrado para este dia.</Text>
            )}
          </View>
        </>
      )}

      {/* Modal Confirmar */}
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

      {/* Modal Sucesso */}
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