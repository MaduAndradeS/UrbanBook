import Calendar from '@/components/calendar';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { API_URL } from '../../config/api';
const ID_CLIENTE = 1;

type Status = 'confirmado' | 'pendente';

interface Appointment {
  id: string;
  name: string;
  date: string;
  time: string;
  status: Status;
  day: number;
  month: number; 
  year: number;
}

function filterByMonth(data: Appointment[], month: number, year: number) {
  return data.filter(a => a.month === month && a.year === year);
}
function confirmedDays(data: Appointment[]) {
  return data.filter(a => a.status === 'confirmado').map(a => a.day);
}
function pendingOnlyDays(data: Appointment[]) {
  const confirmed = new Set(confirmedDays(data));
  return data.filter(a => a.status === 'pendente' && !confirmed.has(a.day)).map(a => a.day);
}

const STATUS = {
  confirmado: { label: 'Confirmado', color: '#2DC26B', icon: '✅' },
  pendente:   { label: 'Pendente',   color: '#F5A623', icon: '🕐' },
};

const INITIAL_YEAR  = 2026;
const INITIAL_MONTH = 3; 

export default function AgendamentosScreen() {
  const [year, setYear]         = useState(INITIAL_YEAR);
  const [month, setMonth]       = useState(INITIAL_MONTH);
  const [selectedDay, setDay]   = useState(new Date().getDate());
  const [monthData, setMonthData] = useState<Appointment[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    buscarDoBanco();
  }, [month, year]);

  async function buscarDoBanco() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/agendamentos/cliente/${ID_CLIENTE}`);
      if (res.ok) {
        const banco = await res.json();
        
        // 🟢 BLINDAGEM DO .MAP(): Evita tela vermelha
        const dadosSeguros = Array.isArray(banco) ? banco : [];
        
        const convertidos: Appointment[] = dadosSeguros.map((ag: any) => {
          const d = new Date(ag.dataInteira || ag.DATA_HORA || new Date());
          return {
            id: String(ag.id),
            name: ag.empresa || 'Sem nome',
            date: `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth()+1).padStart(2, '0')}/${d.getUTCFullYear()}`,
            time: ag.hora || '00:00',
            status: (ag.status || '').toLowerCase() === 'confirmado' ? 'confirmado' : 'pendente',
            day: d.getUTCDate(),
            month: d.getUTCMonth(),
            year: d.getUTCFullYear()
          };
        });
        
        setMonthData(filterByMonth(convertidos, month, year));
      } else {
        setMonthData([]);
      }
    } catch (error) {
      console.log("Erro de conexão no fetch:", error);
      setMonthData([]);
    } finally {
      setLoading(false);
    }
  }

  const handleMonthChange = (m: number, y: number) => {
    setMonth(m); setYear(y); setDay(1);
  };

  const dayAppointments = monthData.filter(a => a.day === selectedDay);
  const otherAppointments = monthData.filter(a => a.day !== selectedDay);

  return (
    <SafeAreaView style={s.safeArea}>
      
      {/* Esconde a barra de navegação nativa do Expo */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Cabeçalho fixo */}
      <View style={s.headerRow}>
        <Text style={s.pageTitle}>Meus Agendamentos</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.calendarCard}>
          {loading ? <ActivityIndicator color="#67C5C0" style={{ padding: 40 }} /> : (
              <Calendar initialYear={INITIAL_YEAR} initialMonth={INITIAL_MONTH} selectedDay={selectedDay} onSelectDay={(day) => setDay(day)} onMonthChange={handleMonthChange} confirmedDays={confirmedDays(monthData)} pendingDays={pendingOnlyDays(monthData)} />
            )}
        </View>

        <Text style={s.sectionTitle}>
          {dayAppointments.length > 0 ? `Agendamentos do dia ${selectedDay}` : `Nenhum agendamento no dia ${selectedDay}`}
        </Text>

        {dayAppointments.map(item => {
          const cfg = STATUS[item.status];
          return (
            <TouchableOpacity key={item.id} style={s.card} activeOpacity={0.8}>
              <View style={s.iconCircle}><Text style={s.iconEmoji}>{cfg.icon}</Text></View>
              <View style={s.cardInfo}>
                <Text style={s.cardName}>{item.name}</Text>
                <Text style={s.cardDate}>{item.date} • {item.time}</Text>
                <Text style={[s.cardStatus, { color: cfg.color }]}>{cfg.icon}  {cfg.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {otherAppointments.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Próximos Agendamentos</Text>
            {otherAppointments.map(item => {
              const cfg = STATUS[item.status];
              return (
                <TouchableOpacity key={item.id} style={s.card} activeOpacity={0.8}>
                  <View style={s.iconCircle}><Text style={s.iconEmoji}>{cfg.icon}</Text></View>
                  <View style={s.cardInfo}>
                    <Text style={s.cardName}>{item.name}</Text>
                    <Text style={s.cardDate}>{item.date} • {item.time}</Text>
                    <Text style={[s.cardStatus, { color: cfg.color }]}>{cfg.icon}  {cfg.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 18, paddingHorizontal: 20, zIndex: 50 },
  scroll:    { flex: 1, paddingHorizontal: 20 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#111' },
  calendarCard: { backgroundColor: '#fff', borderRadius: 16, padding: 8, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 12 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3, alignItems: 'center' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  iconEmoji:  { fontSize: 22 },
  cardInfo:   { flex: 1 },
  cardName:   { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 3 },
  cardDate:   { fontSize: 12, color: '#777', marginBottom: 4 },
  cardStatus: { fontSize: 13, fontWeight: '600' },
});