import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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

type Periodo = {
  inicio: Date;
  fim: Date;
};

export default function Disponibilidade() {
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

  // Data de hoje para travar o calendário
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
      const periodosString = periodos.map(p => `${formatarHora(p.inicio)}-${formatarHora(p.fim)}`).join(',');
      const diasAtivosString = Object.keys(diasAtivos).filter(d => diasAtivos[d]).join(',');
      const bloqueiosString = Object.entries(bloqueados).flatMap(([dia, horas]) => horas.map(h => `${dia}T${h}`)).join(',');

      const response = await fetch(`${API_URL}/empresarios/disponibilidade`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ID_EMPRESARIO: 1, 
          DURACAO: duracao,
          PERIODOS: periodosString,
          DIAS_ATIVOS: diasAtivosString,
          BLOQUEIOS: bloqueiosString
        })
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Configurações de agenda salvas!");
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

      <Text style={styles.titulo}>Configuração</Text>

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

      <Text style={styles.subtitulo}>Horário de Funcionamento</Text>

      {periodos.map((p: Periodo, i: number) => (
        <View key={`${p.inicio}-${p.fim}-${i}`} style={styles.periodo}>

          <TouchableOpacity
            onPress={() => abrirPicker(i, 'inicio')}
            style={styles.timeBtn}
          >
            <Text>Início: {formatarHora(p.inicio)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => abrirPicker(i, 'fim')}
            style={styles.timeBtn}
          >
            <Text>Fim: {formatarHora(p.fim)}</Text>
          </TouchableOpacity>

        </View>
      ))}

      <TouchableOpacity
        onPress={() =>
          setPeriodos((prev: Periodo[]) => [
            ...prev,
            { inicio: new Date(), fim: new Date() }
          ])
        }
      >
        <Text style={{ marginTop: 15, color: '#007AFF', fontWeight: 'bold' }}>+ Adicionar Horário</Text>
      </TouchableOpacity>

      <Calendar
        minDate={hoje}
        theme={{
          textDisabledColor: '#d9e1e8',
          todayTextColor: '#007AFF',
          selectedDayBackgroundColor: '#000',
        }}
        style={{ marginTop: 20, borderRadius: 10, elevation: 2 }}
        onDayPress={(day: DateData) => {
          const dia = day.dateString;
          
          if (dia < hoje) return;

          const novoEstado = !diasAtivos[dia]; 
          setDiasAtivos(prev => ({ ...prev, [dia]: novoEstado }));
          setDiaSelecionado(dia);

          if (novoEstado) {
            gerarHorarios(dia);
          } else {
            setHorariosPorDia(prev => {
              const copy = { ...prev };
              delete copy[dia];
              return copy;
            });
            setBloqueados(prev => {
              const copy = { ...prev };
              delete copy[dia];
              return copy;
            });
          }
        }}
        markedDates={Object.fromEntries(
          Object.entries(diasAtivos)
            .filter(([_, ativo]) => ativo)
            .map(([dia]) => [dia, { selected: true, selectedColor: '#000' }])
        )}
      />

      {diaSelecionado && diasAtivos[diaSelecionado] && (
        <>
          <Text style={styles.subtitulo}>Horários de {diaSelecionado} (Toque para bloquear)</Text>
          <View style={styles.lista}>
            {(horariosPorDia[diaSelecionado] || []).map((h: string) => {
              const bloqueado = bloqueados[diaSelecionado]?.includes(h);
              return (
                <TouchableOpacity
                  key={h}
                  onPress={() => {
                    setBloqueados(prev => {
                      const lista = prev[diaSelecionado] ?? [];
                      return {
                        ...prev,
                        [diaSelecionado]: lista.includes(h)
                          ? lista.filter((x: string) => x !== h)
                          : [...lista, h]
                      };
                    });
                  }}
                  style={[styles.horario, { backgroundColor: bloqueado ? '#ccc' : '#000' }]}
                >
                  <Text style={{ color: '#fff' }}>{h}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <TouchableOpacity 
        style={styles.btnSalvarGeral} 
        onPress={salvarAgenda}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>SALVAR AGENDA</Text>
        )}
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>
              {tipoPicker === 'inicio' ? 'Selecionar início' : 'Selecionar fim'}
            </Text>
            <DateTimePicker
              value={periodos[periodoIndex][tipoPicker]}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                if (event.type === 'dismissed' || !selectedDate) {
                  setShowPicker(false);
                  return;
                }
                setPeriodos((prev) => {
                  const copy = [...prev];
                  copy[periodoIndex] = { ...copy[periodoIndex], [tipoPicker]: selectedDate };
                  return copy;
                });
              }}
            />
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowPicker(false)}>
              <Text style={{ color: '#fff' }}>Concluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff'
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  subtitulo: {
    marginTop: 20,
    fontWeight: 'bold'
  },
  contadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginTop: 10,
    padding: 5
  },
  btnContador: {
    backgroundColor: '#000',
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  txtContador: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  },
  displayContador: {
    flex: 1,
    alignItems: 'center'
  },
  txtDuracaoDisplay: {
    fontSize: 18,
    fontWeight: '600'
  },
  periodo: {
    marginTop: 10
  },
  timeBtn: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginTop: 8
  },
  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10
  },
  horario: {
    padding: 10,
    borderRadius: 10
  },
  btnSalvarGeral: {
    marginTop: 40,
    backgroundColor: '#000',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  pickerBox: {
    width: '90%',
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center'
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000'
  },
  doneButton: {
    marginTop: 20,
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  }
});