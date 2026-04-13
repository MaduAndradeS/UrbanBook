import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

  export default function Cliente_Datas() {

    const params = useLocalSearchParams();

    const profissional = {
      nome: params.nome || 'Profissional',
      telefone: '(19) 00000-0000',
      cidade: 'Campinas - SP',
      foto: null
    };

    const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
    const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [agendamentos, setAgendamentos] = useState<Record<string, string[]>>({});

    const horariosPorDia: Record<string, string[]> = {
      '2026-04-10': ['13:00', '14:00', '15:00'],
      '2026-04-11': ['09:00', '10:00'],
      '2026-04-12': ['16:00', '17:00', '18:00'],
    };

    const horarios = horariosPorDia[diaSelecionado ?? ''] ?? [];
    const horariosOcupados = agendamentos[diaSelecionado ?? ''] || [];

    const marked: any = {};

    Object.keys(horariosPorDia).forEach((data) => {
      marked[data] = {
        customStyles: {
          container: {
            backgroundColor: '#000',
            borderRadius: 8,
          },
          text: {
            color: '#fff',
          },
        },
      };
    });

    if (diaSelecionado) {
      marked[diaSelecionado] = {
        customStyles: {
          container: {
            backgroundColor: '#000',
            borderRadius: 8,
          },
          text: {
            color: '#fff',
          },
        },
      };
    }

    return (
      <View style={styles.container}>

        {/* PERFIL DINÂMICO */}
        <View style={styles.perfil}>
          {profissional.foto ? (
            <Image source={{ uri: profissional.foto }} style={styles.foto} />
          ) : (
            <Ionicons name="person-circle" size={60} color="#ccc" />
          )}

          <View style={{ marginLeft: 10 }}>
            <Text style={styles.nome}>{profissional.nome}</Text>
            <Text style={styles.info}>{profissional.telefone}</Text>
            <Text style={styles.info}>{profissional.cidade}</Text>

            <View style={{ flexDirection: 'row' }}>
              {[1,2,3,4,5].map(i => (
                <Ionicons key={i} name="star" size={14} color="#000" />
              ))}
            </View>
          </View>
        </View>

        {/* TAGS */}
        <View style={styles.tags}>
          <Text style={styles.tag}>Encanador</Text>
          <Text style={styles.tag}>Eletricista</Text>
          <Text style={styles.tag}>Marceneiro</Text>
        </View>

        <Text style={styles.titulo}>Agendamento</Text>

        {/* CALENDÁRIO */}
        <Calendar
          markingType={'custom'}
          onDayPress={(day: { dateString: string }) => {
            if (!horariosPorDia[day.dateString]) return;

            setDiaSelecionado(day.dateString);
            setHoraSelecionada(null);
          }}
          markedDates={marked}
          theme={{
            dayTextColor: '#ccc',
            textDisabledColor: '#ccc',
          }}
        />

        {/* HORÁRIOS */}
        <Text style={styles.titulo}>Horários disponíveis</Text>

        <View style={styles.horarios}>
          {horarios.length > 0 ? (
            horarios.map((hora) => {
              const ocupado = horariosOcupados.includes(hora);

              return (
                <TouchableOpacity
                  key={hora}
                  disabled={ocupado}
                  onPress={() => {
                    setHoraSelecionada(hora);
                    setModalVisible(true);
                  }}
                  style={[
                    styles.horario,
                    {
                      backgroundColor: ocupado
                        ? '#ccc'
                        : horaSelecionada === hora
                        ? '#000'
                        : '#2DAAE1'
                    }
                  ]}
                >
                  <Text style={{ color: '#fff' }}>{hora}</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ color: '#888' }}>
              Selecione um dia disponível
            </Text>
          )}
        </View>

        {/* MODAL CONFIRMAÇÃO */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>

              <Text style={styles.modalTitulo}>Confirmar agendamento</Text>

              <Text style={styles.modalTexto}>Dia: {diaSelecionado}</Text>
              <Text style={styles.modalTexto}>Hora: {horaSelecionada}</Text>

              <View style={styles.modalBotoes}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={[styles.botao, { backgroundColor: '#ccc' }]}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (!diaSelecionado || !horaSelecionada) return;

                    setAgendamentos((prev) => {
                      const horariosDoDia = prev[diaSelecionado] || [];

                      return {
                        ...prev,
                        [diaSelecionado]: [...horariosDoDia, horaSelecionada],
                      };
                    });

                    setModalVisible(false);
                    setSucesso(true);
                  }}
                  style={[styles.botao, { backgroundColor: '#67C5C0' }]}
                >
                  <Text style={{ color: '#fff' }}>Confirmar</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

        {/* MODAL SUCESSO */}
        <Modal transparent visible={sucesso} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>

              <Text style={styles.modalTitulo}>Agendado com sucesso!</Text>

              <TouchableOpacity
                onPress={() => setSucesso(false)}
                style={[styles.botao, { backgroundColor: '#67C5C0', marginTop: 10 }]}
              >
                <Text style={{ color: '#fff' }}>OK</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff'
    },

    perfil: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20
    },

    foto: {
      width: 60,
      height: 60,
      borderRadius: 30
    },

    nome: {
      fontSize: 18,
      fontWeight: 'bold'
    },

    info: {
      fontSize: 12,
      color: '#555'
    },

    tags: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20
    },

    tag: {
      backgroundColor: '#67C5C0',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      color: '#fff',
      fontSize: 12
    },

    titulo: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 10
    },

    horarios: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10
    },

    horario: {
      padding: 10,
      borderRadius: 10
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    },

    modalBox: {
      width: '80%',
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 15
    },

    modalTitulo: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10
    },

    modalTexto: {
      fontSize: 14,
      marginBottom: 5
    },

    modalBotoes: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15
    },

    botao: {
      padding: 10,
      borderRadius: 10,
      width: '45%',
      alignItems: 'center'
    } 
  });