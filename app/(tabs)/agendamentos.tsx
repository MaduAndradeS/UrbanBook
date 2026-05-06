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
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../../config/api';

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
  foto: string | null; // Adicionado suporte para foto
  isCancelado: boolean;
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
const INITIAL_MONTH = 4;

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
      const idSalvo = await AsyncStorage.getItem('id_usuario');
      if (!idSalvo) {
         setLoading(false);
         return;
      }

      const res = await fetch(`${API_URL}/agendamentos/cliente/${idSalvo}`);
      if (res.ok) {
        const banco = await res.json();
        const dadosSeguros = Array.isArray(banco) ? banco : [];
        
        const convertidos: Appointment[] = dadosSeguros.map((ag: any) => {
          const idAgendamento = ag.ID_AGENDAMENTO || ag.ID_AGENDA || ag.id;
          const id = String(idAgendamento || Math.random());
          
          const isConfirmado = ag.CONFIRMACAO === true || ag.confirmacao === true;
          const isCancelado = ag.CANCELAMENTO === true || ag.cancelamento === true;
          const status: Status = isConfirmado ? 'confirmado' : 'pendente';
          
          const name = ag.EMPRESARIO?.NOME || ag.empresa || 'Profissional';
          const foto = ag.EMPRESARIO?.FOTO_PERFIL || null; // Puxa a foto do Empresário
          
          let day = 1, monthAg = 0, yearAg = 2026;
          let dateFmt = 'Sem Data', timeFmt = '00:00';
          
          let rawDate = ag.DATA_HORA || ag.data_hora || ag.createdAt;
          if (rawDate) {
              rawDate = String(rawDate);
              if (rawDate.includes('T')) {
                  const dObj = new Date(rawDate);
                  dObj.setUTCHours(dObj.getUTCHours() - 3); // Corrige Fuso para o calendário marcar certo
                  day = dObj.getDate(); monthAg = dObj.getMonth(); yearAg = dObj.getFullYear();
                  dateFmt = `${String(day).padStart(2, '0')}/${String(monthAg + 1).padStart(2, '0')}/${yearAg}`;
                  timeFmt = `${String(dObj.getHours()).padStart(2, '0')}:${String(dObj.getMinutes()).padStart(2, '0')}`;
              }
          }

          return { id, name, date: dateFmt, time: timeFmt, status, day, month: monthAg, year: yearAg, foto, isCancelado };
        });
        
        const convertidosValidos = convertidos.filter(item => !item.isCancelado && item.date !== 'Sem Data');
        setMonthData(filterByMonth(convertidosValidos, month, year));
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
      <Stack.Screen options={{ headerShown: false }} />
      <View style={s.headerRow}>
        <Text style={s.pageTitle}>Meus Agendamentos</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.calendarCard}>
          {loading ? <ActivityIndicator color="#67C5C0" style={{ padding: 40 }} /> : (
              <Calendar 
                 initialYear={INITIAL_YEAR} 
                 initialMonth={INITIAL_MONTH} 
                 selectedDay={selectedDay} 
                 onSelectDay={(day) => setDay(day)} 
                 onMonthChange={handleMonthChange} 
                 confirmedDays={confirmedDays(monthData)} 
                 pendingDays={pendingOnlyDays(monthData)} 
              />
            )}
        </View>

        <Text style={s.sectionTitle}>
          {dayAppointments.length > 0 ? `Agendamentos do dia ${selectedDay}` : `Sem compromissos no dia ${selectedDay}`}
        </Text>

        {dayAppointments.map(item => {
          const cfg = STATUS[item.status];
          return (
            <TouchableOpacity key={item.id} style={s.card} activeOpacity={0.8}>
              <View style={s.iconCircle}>
                {/* Lógica da Imagem Ativada */}
                {item.foto ? (
                  <Image source={{ uri: item.foto }} style={s.fotoAvatar} />
                ) : (
                  <Text style={s.iconEmoji}>{cfg.icon}</Text>
                )}
              </View>
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
                  <View style={s.iconCircle}>
                    {/* Lógica da Imagem Ativada */}
                    {item.foto ? (
                      <Image source={{ uri: item.foto }} style={s.fotoAvatar} />
                    ) : (
                      <Text style={s.iconEmoji}>{cfg.icon}</Text>
                    )}
                  </View>
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
  fotoAvatar: { width: 48, height: 48, borderRadius: 24 }, // Estilo da Foto Adicionado
  iconEmoji:  { fontSize: 22 },
  cardInfo:   { flex: 1 },
  cardName:   { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 3 },
  cardDate:   { fontSize: 12, color: '#777', marginBottom: 4 },
  cardStatus: { fontSize: 13, fontWeight: '600' },
});