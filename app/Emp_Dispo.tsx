import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

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

      if (inicio >= fim) return; // validação

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

  function abrirPicker(index: number, tipo: 'inicio' | 'fim') {
    setPeriodoIndex(index);
    setTipoPicker(tipo);
    setShowPicker(true);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.titulo}>Configuração</Text>

      <Text style={styles.subtitulo}>Duração</Text>

      <View style={styles.linha}>
        {[30, 60, 90, 120, 150, 180].map((d: number) => (
          <TouchableOpacity
            key={d}
            style={[styles.botao, duracao === d && styles.selecionado]}
            onPress={() => setDuracao(d)}
          >
            <Text style={duracao === d ? { color: '#fff' } : undefined}>
              {d >= 60 ? `${d / 60}h` : `${d}min`}
            </Text>
          </TouchableOpacity>
        ))}
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
        <Text style={{ marginTop: 10 }}>+ Adicionar Horário</Text>
      </TouchableOpacity>

      <Calendar
        onDayPress={(day: DateData) => {
          const dia = day.dateString;

          const novoEstado = !diasAtivos[dia]; // calcula antes

          setDiasAtivos(prev => ({
            ...prev,
            [dia]: novoEstado
          }));

          setDiaSelecionado(dia);

          if (novoEstado) {
            gerarHorarios(dia);
          } else {
            // opcional: limpar horários ao desmarcar
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
              .map(([dia]) => [
                dia,
                {
                  selected: true,
                  selectedColor: '#000'
                }
              ])
          )}
      />

      {diaSelecionado && diasAtivos[diaSelecionado] && (
        <>
          <Text style={styles.subtitulo}>
            Horários de {diaSelecionado}
          </Text>

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

                setPeriodos((prev: Periodo[]) => {
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