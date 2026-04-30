import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const API_URL = 'http://192.168.0.225:3333/api';

LocaleConfig.locales['br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
};
LocaleConfig.defaultLocale = 'br';

export default function Meus_agendamentos() {
  const [diaSelecionado, setDiaSelecionado] = useState<string>(new Date().toISOString().split('T')[0]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const idCliente = 1;

  useEffect(() => {
    buscarMeusAgendamentos();
  }, [diaSelecionado]);

  async function buscarMeusAgendamentos() {
    setLoading(true); // Liga a bolinha
    try {
      const res = await fetch(`${API_URL}/agendamentos/cliente/${idCliente}?data=${diaSelecionado}`);
      
      if (res.ok) {
        const data = await res.json();
        setAgendamentos(Array.isArray(data) ? data : []);
      } else {
        setAgendamentos([]);
      }
    } catch (e) {
      setAgendamentos([]);
    } finally {
      setLoading(false); // DESLIGA A BOLINHA AQUI
    }
  }

  const renderStatus = (status: string) => {
    const isConfirmado = status === 'Confirmado';
    return (
      <View style={styles.statusBadge}>
        <Ionicons name={isConfirmado ? "checkmark-circle-outline" : "time-outline"} size={16} color={isConfirmado ? "#28A745" : "#D4A017"} />
        <Text style={[styles.statusText, { color: isConfirmado ? "#28A745" : "#D4A017" }]}>{status}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color="#000" />
        <Text style={styles.headerTitle}>Meus Agendamentos</Text>
        <View style={{ width: 24 }} />
      </View>

      <Calendar
        current={diaSelecionado}
        onDayPress={(day: any) => setDiaSelecionado(day.dateString)}
        markedDates={{ [diaSelecionado]: { selected: true, selectedColor: '#333' } }}
        theme={{ todayTextColor: '#67C5C0', arrowColor: '#000' }}
      />

      <View style={styles.listaContainer}>
        <Text style={styles.sectionTitle}>Próximas Reservas</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#67C5C0" />
        ) : agendamentos.length > 0 ? (
          agendamentos.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.logoContainer}>
                 <MaterialCommunityIcons name="calendar-clock" size={28} color="#555" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.nome}>{item.empresa}</Text>
                {/* DATA DINÂMICA ARRUMADA */}
                <Text style={styles.dataHora}>{diaSelecionado.split('-').reverse().join('/')} • {item.hora}</Text>
                {renderStatus(item.status)}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.vazio}>Sem reservas para este dia.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 30 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  listaContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
  logoContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  dataHora: { fontSize: 13, color: '#666', marginTop: 4, marginBottom: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 14, fontWeight: 'bold', marginLeft: 4 },
  vazio: { textAlign: 'center', color: '#999', marginTop: 20 }
});