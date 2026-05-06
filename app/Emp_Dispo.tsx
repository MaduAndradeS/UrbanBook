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

  // Horários padrão
  const dataInicioPadrao = new Date();
  dataInicioPadrao.setHours(8, 0, 0, 0);

  const dataFimPadrao = new Date();
  dataFimPadrao.setHours(18, 0, 0, 0);

  const [periodos, setPeriodos] = useState<Periodo[]>([
    {
      inicio: new Date(dataInicioPadrao),
      fim: new Date(dataFimPadrao),
    },
  ]);

  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [tipoPicker, setTipoPicker] = useState<'inicio' | 'fim'>('inicio');
  const [periodoIndex, setPeriodoIndex] = useState<number>(0);

  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  // MULTI-SELEÇÃO DE DATAS
  const [diasAtivos, setDiasAtivos] = useState<Record<string, boolean>>({});

  const [horariosPorDia, setHorariosPorDia] = useState<
    Record<string, string[]>
  >({});

  const [bloqueados, setBloqueados] = useState<
    Record<string, string[]>
  >({});

  const [carregando, setCarregando] = useState<boolean>(false);

  const hoje = new Date().toISOString().split('T')[0];

  // =========================
  // FORMATAR HORA
  // =========================
  function formatarHora(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`;
  }

  // =========================
  // CONVERTER PARA MINUTOS
  // =========================
  function toMin(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  // =========================
  // GERAR HORÁRIOS
  // =========================
  function gerarHorarios(dia: string) {
    const set = new Set<string>();

    periodos.forEach((p) => {
      const inicio = toMin(p.inicio);
      const fim = toMin(p.fim);

      if (inicio >= fim) return;

      let t = inicio;

      while (t + duracao <= fim) {
        const h = Math.floor(t / 60);
        const m = t % 60;

        const horario = `${String(h).padStart(2, '0')}:${String(
          m
        ).padStart(2, '0')}`;

        set.add(horario);
        t += duracao;
      }
    });

    setHorariosPorDia((prev) => ({
      ...prev,
      [dia]: Array.from(set),
    }));
  }

  // =========================
  // SALVAR AGENDA
  // =========================
  async function salvarAgenda() {
    setCarregando(true);

    try {
      const idLogado = await AsyncStorage.getItem('id_usuario');

      if (!idLogado) {
        Alert.alert(
          'Erro',
          'Sessão inválida. Faça login novamente.'
        );
        setCarregando(false);
        return;
      }

      // PERÍODOS
      const periodosString = periodos
        .map(
          (p) =>
            `${formatarHora(p.inicio)}-${formatarHora(
              p.fim
            )}`
        )
        .join(',');

      // DATAS ESPECÍFICAS
      const diasAtivosString = Object.keys(diasAtivos)
        .filter((dia) => diasAtivos[dia])
        .join(',');

      if (!diasAtivosString) {
        Alert.alert(
          'Atenção',
          'Selecione pelo menos um dia no calendário.'
        );
        setCarregando(false);
        return;
      }

      // BLOQUEIOS
      const bloqueiosString = Object.entries(bloqueados)
        .flatMap(([dia, horas]) =>
          horas.map((h) => `${dia}T${h}`)
        )
        .join(',');

      console.log({
        ID_EMPRESARIO: Number(idLogado),
        DURACAO_MIN: Number(duracao),
        PERIODOS: periodosString,
        DIAS_ATIVOS: diasAtivosString,
        BLOQUEIOS: bloqueiosString,
      });

      const response = await fetch(
        `${API_URL}/empresarios/disponibilidade`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ID_EMPRESARIO: Number(idLogado),
            DURACAO_MIN: Number(duracao),
            PERIODOS: periodosString,
            DIAS_ATIVOS: diasAtivosString,
            BLOQUEIOS: bloqueiosString,
          }),
        }
      );

      if (response.ok) {
        Alert.alert(
          'Sucesso',
          'Configurações de agenda salvas!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        const erroTexto = await response.text();
        console.log('Erro servidor:', erroTexto);

        Alert.alert(
          'Erro',
          'Erro ao salvar no servidor.'
        );
      }
    } catch (e) {
      console.log(e);

      Alert.alert(
        'Erro',
        'Não foi possível conectar ao servidor.'
      );
    } finally {
      setCarregando(false);
    }
  }

  // =========================
  // PICKER
  // =========================
  function abrirPicker(
    index: number,
    tipo: 'inicio' | 'fim'
  ) {
    setPeriodoIndex(index);
    setTipoPicker(tipo);
    setShowPicker(true);
  }

  // =========================
  // ALTERAR DURAÇÃO
  // =========================
  const alterarDuracao = (valor: number) => {
    setDuracao((prev) => {
      const novo = prev + valor;
      return novo > 0 ? novo : 5;
    });
  };

  // =========================
  // RENDER
  // =========================
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>
        Configuração de Agenda
      </Text>

      {/* DURAÇÃO */}
      <Text style={styles.subtitulo}>
        Duração do Atendimento
      </Text>

      <View style={styles.contadorContainer}>
        <TouchableOpacity
          style={styles.btnContador}
          onPress={() => alterarDuracao(-5)}
        >
          <Text style={styles.txtContador}>-</Text>
        </TouchableOpacity>

        <View style={styles.displayContador}>
          <Text style={styles.txtDuracaoDisplay}>
            {Math.floor(duracao / 60) > 0
              ? `${Math.floor(duracao / 60)}h `
              : ''}
            {duracao % 60}min
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnContador}
          onPress={() => alterarDuracao(5)}
        >
          <Text style={styles.txtContador}>+</Text>
        </TouchableOpacity>
      </View>

      {/* HORÁRIOS */}
      <Text style={styles.subtitulo}>
        Horários de Trabalho
      </Text>

      {periodos.map((p, i) => (
        <View key={i} style={styles.periodoRow}>
          <TouchableOpacity
            onPress={() => abrirPicker(i, 'inicio')}
            style={styles.timeBtn}
          >
            <Text>
              Início: {formatarHora(p.inicio)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => abrirPicker(i, 'fim')}
            style={styles.timeBtn}
          >
            <Text>
              Fim: {formatarHora(p.fim)}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={() =>
          setPeriodos((prev) => [
            ...prev,
            {
              inicio: new Date(dataInicioPadrao),
              fim: new Date(dataFimPadrao),
            },
          ])
        }
      >
        <Text style={styles.addHorario}>
          + Adicionar Horário
        </Text>
      </TouchableOpacity>

      {/* CALENDÁRIO */}
      <Text style={styles.subtitulo}>
        Selecione os dias específicos
      </Text>

      <Calendar
        minDate={hoje}
        onDayPress={(day: DateData) => {
          const dia = day.dateString;

          if (dia < hoje) return;

          // MULTI-SELEÇÃO
          setDiasAtivos((prev) => ({
            ...prev,
            [dia]: !prev[dia],
          }));

          setDiaSelecionado(dia);

          gerarHorarios(dia);
        }}
        markedDates={Object.fromEntries(
          Object.entries(diasAtivos)
            .filter(([_, ativo]) => ativo)
            .map(([dia]) => [
              dia,
              {
                selected: true,
                selectedColor: '#67C5C0',
              },
            ])
        )}
        theme={{
          selectedDayBackgroundColor: '#67C5C0',
          todayTextColor: '#67C5C0',
        }}
        style={styles.calendar}
      />

      {/* BLOQUEIOS */}
      {diaSelecionado &&
        diasAtivos[diaSelecionado] && (
          <>
            <Text style={styles.subtitulo}>
              Bloquear horários em{' '}
              {diaSelecionado
                .split('-')
                .reverse()
                .join('/')}
            </Text>

            <View style={styles.listaHorarios}>
              {(horariosPorDia[diaSelecionado] ||
                []).map((h) => {
                const isBloqueado =
                  bloqueados[diaSelecionado]?.includes(
                    h
                  ) || false;

                return (
                  <TouchableOpacity
                    key={h}
                    onPress={() => {
                      setBloqueados((prev) => {
                        const lista =
                          prev[diaSelecionado] ??
                          [];

                        return {
                          ...prev,
                          [diaSelecionado]:
                            isBloqueado
                              ? lista.filter(
                                  (x) => x !== h
                                )
                              : [...lista, h],
                        };
                      });
                    }}
                    style={[
                      styles.chipHorario,
                      {
                        backgroundColor:
                          isBloqueado
                            ? '#FF5252'
                            : '#67C5C0',
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.chipHorarioText
                      }
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

      {/* SALVAR */}
      <TouchableOpacity
        style={styles.btnSalvar}
        onPress={salvarAgenda}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnSalvarText}>
            SALVAR DISPONIBILIDADE
          </Text>
        )}
      </TouchableOpacity>

      {/* PICKER */}
      {showPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerBox}>
            <DateTimePicker
              value={
                periodos[periodoIndex][tipoPicker]
              }
              mode="time"
              is24Hour
              display={
                Platform.OS === 'ios'
                  ? 'spinner'
                  : 'default'
              }
              onChange={(
                event: DateTimePickerEvent,
                selectedDate?: Date
              ) => {
                if (
                  Platform.OS === 'android'
                ) {
                  setShowPicker(false);
                }

                if (
                  event.type ===
                    'dismissed' ||
                  !selectedDate
                ) {
                  setShowPicker(false);
                  return;
                }

                setPeriodos((prev) => {
                  const copy = [...prev];

                  copy[periodoIndex] = {
                    ...copy[periodoIndex],
                    [tipoPicker]:
                      selectedDate,
                  };

                  return copy;
                });
              }}
            />

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() =>
                setShowPicker(false)
              }
            >
              <Text
                style={
                  styles.doneButtonText
                }
              >
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF',
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  subtitulo: {
    marginTop: 25,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },

  contadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginTop: 10,
    padding: 10,
  },

  btnContador: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  txtContador: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  displayContador: {
    flex: 1,
    alignItems: 'center',
  },

  txtDuracaoDisplay: {
    fontSize: 18,
    fontWeight: '600',
  },

  periodoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },

  timeBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
  },

  addHorario: {
    marginTop: 15,
    color: '#007AFF',
    fontWeight: 'bold',
  },

  calendar: {
    marginTop: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },

  listaHorarios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 15,
  },

  chipHorario: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 4,
  },

  chipHorarioText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  btnSalvar: {
    marginTop: 30,
    backgroundColor: '#000',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },

  btnSalvarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  pickerBox: {
    width: '90%',
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  doneButton: {
    marginTop: 20,
    backgroundColor: '#67C5C0',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },

  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});