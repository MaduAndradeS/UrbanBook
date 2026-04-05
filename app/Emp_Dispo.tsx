import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function Disponibilidade() {
  const [duracao, setDuracao] = useState(30);

  const [periodos, setPeriodos] = useState([
    { inicio: new Date(), fim: new Date() }
  ]);

  const [showPicker, setShowPicker] = useState(false);
  const [tipoPicker, setTipoPicker] = useState<'inicio' | 'fim'>('inicio');
  const [periodoIndex, setPeriodoIndex] = useState(0);

  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  // ✅ NOVO: controle de dias ativos
  const [diasAtivos, setDiasAtivos] = useState<Record<string, boolean>>({});

  const [horariosPorDia, setHorariosPorDia] = useState<Record<string, string[]>>({});
  const [bloqueados, setBloqueados] = useState<Record<string, string[]>>({});

  function formatarHora(date: Date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  function toMin(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  function gerarHorarios(dia: string) {
    let lista: string[] = [];

    periodos.forEach(p => {
      let t = toMin(p.inicio);
      const fim = toMin(p.fim);

      while (t + duracao <= fim) {
        const h = Math.floor(t / 60);
        const m = t % 60;

        lista.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        t += duracao;
      }
    });

    setHorariosPorDia(prev => ({
      ...prev,
      [dia]: lista
    }));
  }

  function abrirPicker(index: number, tipo: 'inicio' | 'fim') {
    setPeriodoIndex(index);
    setTipoPicker(tipo);
    setShowPicker(true);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* CONFIGURAÇÃO */}
      <Text style={styles.titulo}>Configuração</Text>

      <Text style={styles.subtitulo}>Duração</Text>

      <View style={styles.linha}>
        {[30, 60, 90, 120].map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.botao, duracao === d && styles.selecionado]}
            onPress={() => setDuracao(d)}
          >
            <Text style={duracao === d && { color: '#fff' }}>
              {d >= 60 ? `${d / 60}h` : `${d}min`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitulo}>Períodos</Text>

      {periodos.map((p, i) => (
        <View key={i} style={styles.periodo}>
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
          setPeriodos(prev => [...prev, { inicio: new Date(), fim: new Date() }])
        }
      >
        <Text style={{ marginTop: 10 }}>+ Adicionar período</Text>
      </TouchableOpacity>

      {/* CALENDÁRIO */}
      <Calendar
        onDayPress={(day) => {
          const dia = day.dateString;

          // toggle dia ativo
          setDiasAtivos(prev => {
            const novoEstado = !prev[dia];

            return {
              ...prev,
              [dia]: novoEstado
            };
          });

          setDiaSelecionado(dia);

          // gera horários apenas se ativou
          if (!diasAtivos[dia]) {
            gerarHorarios(dia);
          }
        }}
        markedDates={Object.fromEntries(
          Object.keys(diasAtivos).map(dia => [
            dia,
            {
              selected: true,
              selectedColor: '#000'
            }
          ])
        )}
      />

      {/* HORÁRIOS */}
      {diaSelecionado && diasAtivos[diaSelecionado] && (
        <>
          <Text style={styles.subtitulo}>
            Horários de {diaSelecionado}
          </Text>

          <View style={styles.lista}>
            {(horariosPorDia[diaSelecionado] || []).map(h => {
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
                          ? lista.filter(x => x !== h)
                          : [...lista, h]
                      };
                    });
                  }}
                  style={[
                    styles.horario,
                    { backgroundColor: bloqueado ? '#ccc' : '#000' }
                  ]}
                >
                  <Text style={{ color: '#fff' }}>{h}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {/* PICKER */}
      {showPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>
              {tipoPicker === 'inicio' ? 'Selecionar início' : 'Selecionar fim'}
            </Text>

            <DateTimePicker
              value={periodos[periodoIndex][tipoPicker]}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (event.type === 'dismissed' || !selectedDate) {
                  setShowPicker(false);
                  return;
                }

                setPeriodos(prev => {
                  const copy = [...prev];

                  copy[periodoIndex] = {
                    ...copy[periodoIndex],
                    [tipoPicker]: selectedDate
                  };

                  return copy;
                });
              }}
            />

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowPicker(false)}
            >
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
    marginTop: 10,
    fontWeight: 'bold'
  },

  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },

  botao: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eee'
  },

  selecionado: {
    backgroundColor: '#000'
  },

  periodo: {
    marginTop: 10
  },

  timeBtn: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginTop: 5
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

  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  pickerBox: {
    width: '90%',
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center'
  },

  pickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff'
  },

  doneButton: {
    marginTop: 10,
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  }
});