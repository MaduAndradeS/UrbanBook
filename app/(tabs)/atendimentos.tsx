import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import Calendar from '@/components/calendar';

// ─── TIPOS ────────────────────────────────────────────────────
type Status = 'confirmado' | 'pendente';

interface Appointment {
  id: string;
  name: string;
  date: string;
  time: string;
  service: string;
  status: Status;
  day: number;
  month: number; // 0-indexed
  year: number;
}

// ─── MOCK DATA ────────────────────────────────────────────────
// Quando o banco estiver pronto, substitua esta lista por uma
// chamada fetch/axios: const data = await api.get('/atendimentos')
const MOCK_DATA: Appointment[] = [
  {
    id: '1',
    name: 'Pedro Cardoso',
    date: 'Quarta, 10 Mar',
    time: '10:00 - 11:00',
    service: 'Hidratação e corte de cabelo',
    status: 'confirmado',
    day: 10, month: 2, year: 2025,
  },
  {
    id: '2',
    name: 'João Vitor Minelli',
    date: 'Quarta, 10 Mar',
    time: '13:00 - 14:00',
    service: 'Corte de Cabelo',
    status: 'confirmado',
    day: 10, month: 2, year: 2025,
  },
  {
    id: '3',
    name: 'Ana Lima',
    date: 'Sexta, 14 Mar',
    time: '15:00 - 16:00',
    service: 'Escova progressiva',
    status: 'pendente',
    day: 14, month: 2, year: 2025,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────
function filterByMonth(data: Appointment[], month: number, year: number) {
  return data.filter(a => a.month === month && a.year === year);
}

function confirmedDays(data: Appointment[]) {
  return data.filter(a => a.status === 'confirmado').map(a => a.day);
}

function pendingOnlyDays(data: Appointment[]) {
  const confirmed = new Set(confirmedDays(data));
  return data
    .filter(a => a.status === 'pendente' && !confirmed.has(a.day))
    .map(a => a.day);
}

// ─── TELA ─────────────────────────────────────────────────────
const INITIAL_YEAR  = 2025;
const INITIAL_MONTH = 2; // Março (0-indexed)

export default function AtendimentosScreen() {
  const [year, setYear]           = useState(INITIAL_YEAR);
  const [month, setMonth]         = useState(INITIAL_MONTH);
  const [selectedDay, setDay]     = useState(10);
  const [monthData, setMonthData] = useState<Appointment[]>([]);
  const [loading, setLoading]     = useState(true);

  // Simula busca ao banco — troque pelo fetch real aqui
  useEffect(() => {
    setLoading(true);
    // TODO: substituir por → fetch(`/api/atendimentos?month=${month}&year=${year}`)
    const data = filterByMonth(MOCK_DATA, month, year);
    setMonthData(data);
    setLoading(false);
  }, [month, year]);

  const handleMonthChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
    setDay(1);
  };

  const dayAppointments = monthData.filter(a => a.day === selectedDay);

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.topHeader}>
          <Text style={s.brandName}>Urban Book</Text>
          <View style={s.headerIcons}>
            <TouchableOpacity style={s.iconBtn}>
              <Text style={s.iconBtnText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn}>
              <Text style={s.iconBtnText}>📋</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.pageTitle}>Meus Atendimentos</Text>

        {/* Calendário */}
        <View style={s.calendarCard}>
          {loading
            ? <ActivityIndicator color="#67C5C0" style={{ padding: 40 }} />
            : (
              <Calendar
                initialYear={INITIAL_YEAR}
                initialMonth={INITIAL_MONTH}
                selectedDay={selectedDay}
                onSelectDay={(day) => setDay(day)}
                onMonthChange={handleMonthChange}
                confirmedDays={confirmedDays(monthData)}
                pendingDays={pendingOnlyDays(monthData)}
              />
            )
          }
        </View>

        {/* Atendimentos do dia selecionado */}
        <Text style={s.sectionTitle}>
          {dayAppointments.length > 0
            ? `Atendimentos do dia ${selectedDay}`
            : `Nenhum atendimento no dia ${selectedDay}`}
        </Text>

        {dayAppointments.map(item => (
          <TouchableOpacity key={item.id} style={s.card} activeOpacity={0.8}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarInitial}>{item.name.charAt(0)}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardName}>{item.name}</Text>
              <Text style={s.cardDate}>{item.date} • {item.time}</Text>
              <Text style={s.cardService}>{item.service}</Text>
              <Text style={[
                s.cardStatus,
                { color: item.status === 'confirmado' ? '#2DC26B' : '#F5A623' }
              ]}>
                {item.status === 'confirmado' ? '✓  Confirmado' : '⏱  Pendente'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        <TouchableOpacity style={s.tabItem}><Text style={s.tabIcon}>🏠</Text></TouchableOpacity>
        <TouchableOpacity style={s.tabItem}><Text style={s.tabIcon}>🔍</Text></TouchableOpacity>
        <TouchableOpacity style={[s.tabItem, s.tabActive]}><Text style={s.tabIcon}>📅</Text></TouchableOpacity>
        <TouchableOpacity style={s.tabItem}><Text style={s.tabIcon}>👤</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scroll:   { flex: 1, paddingHorizontal: 20 },

  topHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 16, marginBottom: 4,
  },
  brandName:   { fontSize: 20, color: '#999', fontWeight: '400' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 8,
    borderWidth: 1, borderColor: '#ddd',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18 },

  pageTitle: {
    fontSize: 26, fontWeight: 'bold', color: '#111',
    marginTop: 10, marginBottom: 18,
  },

  calendarCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 8, marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 12 },

  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#67C5C0',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  avatarInitial: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  cardInfo:      { flex: 1 },
  cardName:      { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 3 },
  cardDate:      { fontSize: 12, color: '#777', marginBottom: 3 },
  cardService:   { fontSize: 12, color: '#555', fontStyle: 'italic', marginBottom: 3 },
  cardStatus:    { fontSize: 13, fontWeight: '600' },

  tabBar: {
    flexDirection: 'row', height: 64,
    backgroundColor: '#67C5C0', alignItems: 'center', paddingBottom: 4,
  },
  tabItem:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  tabActive: { borderTopWidth: 2, borderTopColor: '#fff' },
  tabIcon:  { fontSize: 22 },
});
