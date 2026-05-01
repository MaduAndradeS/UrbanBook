import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { API_URL } from '../config/api';
import { useRouter } from 'expo-router';

type Periodo = {
  inicio: Date;
  fim: Date;
};

export default function Disponibilidade() {
  const router = useRouter();
  const [duracao, setDuracao] = useState<number>(30); 

  const [periodos, setPeriodos] = useState<Periodo[]>([
    { inicio: new Date(), fim: new Date() }
  ]);

  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [tipoPicker, setTipoPicker] = useState<'inicio' | 'fim'>('inicio');
  const [periodoIndex, setPeriodoIndex] = useState<number>(0);

  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  const [diasAtivos, setDiasAtivos] = useState<Record<string, boolean>>({});
  const [horariosPorDia, setHorariosPorDia] = useState<Record<string, string[]>>({});
  const [bloqueados, setBloqueados] = useState<Record<string, string[]>>({});
  
  const [carregando, setCarregando] = useState<boolean>(false);

  const hoje = new Date().toISOString().split('T')[0];

  function formatarHora(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  function toMin(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  function gerarHorarios(dia: string) {
    const set = new Set<string>();

    periodos.forEach((p: Periodo) => {
      const inicio = toMin(p.inicio);
      const fim = toMin(p.fim);

      if (inicio >= fim) return; 

      let t = inicio;

      while (t + duracao <= fim) {
        const h = Math.floor(t / 60);
        const m = t % 60;

        const horario = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        set.add(horario);

        t += duracao;
      }
    });

    setHorariosPorDia(prev => ({
      ...prev,
      [dia]: Array.from(set)
    }));
  }

  async function salvarAgenda() {
    setCarregando(true);
    try {
      const idLogado = await AsyncStorage.getItem('id_usuario');
      if(!idLogado) {
          Alert.alert("Erro", "Sessão inválida. Faça login novamente.");
          setCarregando(false);
          return;
      }

      const periodosString = periodos.map(p => `${formatarHora(p.inicio)}-${formatarHora(p.fim)}`).join(',');
      
      // CORREÇÃO: Pegar as datas ISO selecionadas diretamente
      const datasSelecionadas = Object.keys(diasAtivos).filter(data => diasAtivos[data]);
      
      if (datasSelecionadas.length === 0) {
        Alert.alert("Atenção", "Selecione pelo menos um dia no calendário.");
        setCarregando(false);
        return;
      }

      const diasAtivosString = datasSelecionadas.join(',');

      const bloqueiosString = Object.entries(bloqueados).flatMap(([dia, horas]) => 
        horas.map(h => `${dia}T${h}`)
      ).join(',');

      console.log("Enviando duração:", duracao);

      const response = await fetch(`${API_URL}/empresarios/disponibilidade`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ID_EMPRESARIO: Number(idLogado),
          DURACAO_MIN: Number(duracao), // 👈 Forçamos a conversão para número aqui
          PERIODOS: periodosString,
          DIAS_ATIVOS: diasAtivosString, // Agora envia as datas exatas
          BLOQUEIOS: bloqueiosString
        })
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Configurações de agenda salvas!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("Erro", "Erro ao salvar no servidor.");
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  function abrirPicker(index: number, tipo: 'inicio' | 'fim') {
    setPeriodoIndex(index);
    setTipoPicker(tipo);
    setShowPicker(true);
  }

  const alterarDuracao = (valor: number) => {
    setDuracao(prev => {
      const novo = prev + valor;
      return novo > 0 ? novo : 5; 
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Configuração de Agenda</Text>

      <Text style={styles.subtitulo}>Duração do Atendimento</Text>
      <View style={styles.contadorContainer}>
        <TouchableOpacity style={styles.btnContador} onPress={() => alterarDuracao(-5)}>
          <Text style={styles.txtContador}>-</Text>
        </TouchableOpacity>
        <View style={styles.displayContador}>
          <Text style={styles.txtDuracaoDisplay}>
            {Math.floor(duracao / 60) > 0 ? `${Math.floor(duracao / 60)}h ` : ""}
            {duracao % 60}min
          </Text>
        </View>
        <TouchableOpacity style={styles.btnContador} onPress={() => alterarDuracao(5)}>
          <Text style={styles.txtContador}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitulo}>Horários de Trabalho</Text>
      {periodos.map((p, i) => (
        <View key={i} style={styles.periodoRow}>
          <TouchableOpacity onPress={() => abrirPicker(i, 'inicio')} style={styles.timeBtn}>
            <Text>Início: {formatarHora(p.inicio)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => abrirPicker(i, 'fim')} style={styles.timeBtn}>
            <Text>Fim: {formatarHora(p.fim)}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={() => setPeriodos([...periodos, { inicio: new Date(), fim: new Date() }])}>
        <Text style={styles.addBtn}>+ Adicionar Intervalo</Text>
      </TouchableOpacity>

      <Text style={styles.subtitulo}>Selecione os dias específicos</Text>
      <Calendar
        minDate={hoje}
        onDayPress={(day: DateData) => {
          const dia = day.dateString;
          const novoEstado = !diasAtivos[dia]; 
          setDiasAtivos(prev => ({ ...prev, [dia]: novoEstado }));
          setDiaSelecionado(dia);
          if (novoEstado) gerarHorarios(dia);
        }}
        markedDates={Object.fromEntries(
          Object.entries(diasAtivos).filter(([_, a]) => a).map(([d]) => [d, { selected: true, selectedColor: '#67C5C0' }])
        )}
        theme={{ selectedDayBackgroundColor: '#67C5C0', todayTextColor: '#67C5C0' }}
        style={styles.calendar}
      />

      {diaSelecionado && diasAtivos[diaSelecionado] && (
        <>
          <Text style={styles.subtitulo}>Bloquear horários em {diaSelecionado.split('-').reverse().join('/')}</Text>
          <View style={styles.listaHorarios}>
            {(horariosPorDia[diaSelecionado] || []).map((h) => {
              const isBloqueado = bloqueados[diaSelecionado]?.includes(h);
              return (
                <TouchableOpacity
                  key={h}
                  onPress={() => {
                    setBloqueados(prev => {
                      const lista = prev[diaSelecionado] ?? [];
                      return {
                        ...prev,
                        [diaSelecionado]: isBloqueado ? lista.filter(x => x !== h) : [...lista, h]
                      };
                    });
                  }}
                  style={[styles.chipHorario, { backgroundColor: isBloqueado ? '#FF5252' : '#67C5C0' }]}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{h}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.btnSalvar} onPress={salvarAgenda} disabled={carregando}>
        {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>SALVAR DISPONIBILIDADE</Text>}
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerBox}>
            <DateTimePicker
              value={periodos[periodoIndex][tipoPicker]}
              mode="time"
              is24Hour
              display="spinner"
              onChange={(event, date) => {
                if (date) {
                    const copy = [...periodos];
                    copy[periodoIndex][tipoPicker] = date;
                    setPeriodos(copy);
                }
              }}
            />
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowPicker(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFF' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitulo: { marginTop: 25, fontWeight: 'bold', fontSize: 16, color: '#333' },
  contadorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, marginTop: 10, padding: 10 },
  btnContador: { backgroundColor: '#333', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  txtContador: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  displayContador: { flex: 1, alignItems: 'center' },
  txtDuracaoDisplay: { fontSize: 18, fontWeight: 'bold' },
  periodoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  timeBtn: { flex: 0.48, padding: 12, backgroundColor: '#EEE', borderRadius: 10, alignItems: 'center' },
  addBtn: { marginTop: 15, color: '#67C5C0', fontWeight: 'bold' },
  calendar: { marginTop: 15, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1 },
  listaHorarios: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chipHorario: { padding: 10, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  btnSalvar: { marginTop: 40, backgroundColor: '#333', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 50 },
  btnSalvarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  pickerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  pickerBox: { backgroundColor: '#000000', borderRadius: 20, padding: 20, width: '90%', alignItems: 'center' },
  doneButton: { marginTop: 20, backgroundColor: '#67C5C0', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' }
});