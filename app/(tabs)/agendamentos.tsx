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
  status: Status;
  day: number;
  month: number; // 0-indexed
  year: number;
}

// ─── MOCK DATA ────────────────────────────────────────────────
// Quando o banco estiver pronto, substitua esta lista por uma
// chamada fetch/axios: const data = await api.get('/agendamentos')
const MOCK_DATA: Appointment[] = [
  {
    id: '1',
    name: 'Luiz Serviços Gerais',
    date: 'Quarta, 10 Abr',
    time: '10:00 - 11:00',
    status: 'confirmado',
    day: 10, month: 3, year: 2026,
  },
  {
    id: '2',
    name: 'Espaço Julia Martins',
    date: 'Terça, 16 Abr',
    time: '17:00 - 18:00',
    status: 'pendente',
    day: 16, month: 3, year: 2026,
  },
  {
    id: '3',
    name: 'Barbearia Central',
    date: 'Sexta, 25 Abr',
    time: '09:00 - 10:00',
    status: 'confirmado',
    day: 25, month: 3, year: 2026,
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

// ─── STATUS CONFIG ────────────────────────────────────────────
const STATUS = {
  confirmado: { label: 'Confirmado', color: '#2DC26B', icon: '✓' },
  pendente:   { label: 'Pendente',   color: '#F5A623', icon: '⏱' },
};

// ─── TELA ─────────────────────────────────────────────────────
const INITIAL_YEAR  = 2026;
const INITIAL_MONTH = 3; // Abril (0-indexed)

export default function AgendamentosScreen() {
  const [year, setYear]         = useState(INITIAL_YEAR);
  const [month, setMonth]       = useState(INITIAL_MONTH);
  const [selectedDay, setDay]   = useState(10);
  const [monthData, setMonthData] = useState<Appointment[]>([]);
  const [loading, setLoading]   = useState(true);

  // Simula busca ao banco — troque pelo fetch real aqui
  useEffect(() => {
    setLoading(true);
    // TODO: substituir por → fetch(`/api/agendamentos?month=${month}&year=${year}`)
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
  const otherAppointments = monthData.filter(a => a.day !== selectedDay);

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.topHeader}>
          <Text style={s.brandName}>Urban Book</Text>
          <View style={s.iconBtn}>
            <Text style={s.iconBtnText}>📋</Text>
          </View>
        </View>

        <Text style={s.pageTitle}>Meus Agendamentos</Text>

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

        {/* Agendamentos do dia selecionado */}
        <Text style={s.sectionTitle}>
          {dayAppointments.length > 0
            ? `Agendamentos do dia ${selectedDay}`
            : `Nenhum agendamento no dia ${selectedDay}`}
        </Text>

        {dayAppointments.map(item => {
          const cfg = STATUS[item.status];
          return (
            <TouchableOpacity key={item.id} style={s.card} activeOpacity={0.8}>
              <View style={s.iconCircle}>
                <Text style={s.iconEmoji}>
                  {item.status === 'confirmado' ? '✅' : '🕐'}
                </Text>
              </View>
              <View style={s.cardInfo}>
                <Text style={s.cardName}>{item.name}</Text>
                <Text style={s.cardDate}>{item.date} • {item.time}</Text>
                <Text style={[s.cardStatus, { color: cfg.color }]}>
                  {cfg.icon}  {cfg.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Outros agendamentos do mês */}
        {otherAppointments.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { marginTop: 20 }]}>
              Próximos Agendamentos
            </Text>
            {otherAppointments.map(item => {
              const cfg = STATUS[item.status];
              return (
                <TouchableOpacity key={item.id} style={s.card} activeOpacity={0.8}>
                  <View style={s.iconCircle}>
                    <Text style={s.iconEmoji}>
                      {item.status === 'confirmado' ? '✅' : '🕐'}
                    </Text>
                  </View>
                  <View style={s.cardInfo}>
                    <Text style={s.cardName}>{item.name}</Text>
                    <Text style={s.cardDate}>{item.date} • {item.time}</Text>
                    <Text style={[s.cardStatus, { color: cfg.color }]}>
                      {cfg.icon}  {cfg.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

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
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  scroll:    { flex: 1, paddingHorizontal: 20 },

  topHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 16, marginBottom: 4,
  },
  brandName:   { fontSize: 20, color: '#999', fontWeight: '400' },
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
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  iconEmoji:  { fontSize: 22 },
  cardInfo:   { flex: 1 },
  cardName:   { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 3 },
  cardDate:   { fontSize: 12, color: '#777', marginBottom: 4 },
  cardStatus: { fontSize: 13, fontWeight: '600' },

  tabBar: {
    flexDirection: 'row', height: 64,
    backgroundColor: '#67C5C0', alignItems: 'center', paddingBottom: 4,
  },
  tabItem:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  tabActive: { borderTopWidth: 2, borderTopColor: '#fff' },
  tabIcon:  { fontSize: 22 },
});
