import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const API_URL = 'http://192.168.0.225:3333/api';

LocaleConfig.locales['br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
};
LocaleConfig.defaultLocale = 'br';

export default function Meus_atendimentos() {
  const [diaSelecionado, setDiaSelecionado] = useState<string>(new Date().toISOString().split('T')[0]);
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const idEmpresario = 5;

  useEffect(() => {
    buscarAtendimentos();
  }, [diaSelecionado]);

  async function buscarAtendimentos() {
    setLoading(true); // Liga a bolinha
    try {
      const res = await fetch(`${API_URL}/agendamentos/empresario/${idEmpresario}?data=${diaSelecionado}`);
      
      if (res.ok) {
        const data = await res.json();
        setAtendimentos(Array.isArray(data) ? data : []);
      } else {
        setAtendimentos([]);
      }
    } catch (e) {
      setAtendimentos([]); // Se der erro, deixa a lista vazia (sem mock)
    } finally {
      setLoading(false); // GARANTE QUE A BOLINHA PARE DE GIRAR
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color="#000" />
        <Text style={styles.headerTitle}>Meus Atendimentos</Text>
        <Ionicons name="notifications-outline" size={24} color="#000" />
      </View>

      <Calendar
        current={diaSelecionado}
        onDayPress={(day: any) => setDiaSelecionado(day.dateString)}
        markedDates={{ [diaSelecionado]: { selected: true, selectedColor: '#333' } }}
        theme={{ todayTextColor: '#67C5C0', arrowColor: '#000', textMonthFontWeight: 'bold' }}
      />

      <View style={styles.listaContainer}>
        <Text style={styles.sectionTitle}>Atendimentos do dia</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#67C5C0" style={{ marginTop: 20 }} />
        ) : atendimentos.length > 0 ? (
          atendimentos.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.foto }} style={styles.avatar} />
              <View style={styles.cardInfo}>
                <Text style={styles.nome}>{item.cliente}</Text>
                {/* AQUI ESTÁ A DATA DINÂMICA ARRUMADA */}
                <Text style={styles.dataHora}>{diaSelecionado.split('-').reverse().join('/')} • {item.hora}</Text>
                <Text style={styles.servico}>{item.servico}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.vazio}>Nenhum atendimento para este dia.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  listaContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: '#EEE' },
  cardInfo: { flex: 1, justifyContent: 'center' },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  dataHora: { fontSize: 13, color: '#666', marginTop: 2 },
  servico: { fontSize: 13, color: '#888', fontStyle: 'italic', marginTop: 2 },
  vazio: { textAlign: 'center', color: '#999', marginTop: 20 }
});