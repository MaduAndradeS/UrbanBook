import Calendar from '@/components/calendar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal, Pressable,
  SafeAreaView,
  ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import logo from '../../assets/images/logo.png';

import { API_URL } from '../../config/api';
const ID_EMPRESARIO = 5;

type Status = 'confirmado' | 'pendente';

interface Appointment {
  id: string;
  name: string;
  date: string;
  time: string;
  service: string;
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

const INITIAL_YEAR  = 2026;
const INITIAL_MONTH = 3; 

export default function AtendimentosScreen() {
  const [year, setYear]             = useState(INITIAL_YEAR);
  const [month, setMonth]           = useState(INITIAL_MONTH);
  const [selectedDay, setDay]       = useState(new Date().getDate());
  const [monthData, setMonthData]   = useState<Appointment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Appointment[]>([]);

  const naoLidas = notificacoes.length;

  useEffect(() => {
    buscarDoBanco();
  }, [month, year]);

  async function buscarDoBanco() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/agendamentos/empresario/${ID_EMPRESARIO}`);
      if (res.ok) {
        const banco = await res.json();
        const dadosSeguros = Array.isArray(banco) ? banco : [];
        const convertidos: Appointment[] = dadosSeguros.map((ag: any) => {
          const d = new Date(ag.dataInteira || ag.DATA_HORA || new Date());
          return {
            id: String(ag.id),
            name: ag.cliente || 'Sem nome',
            date: `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth()+1).padStart(2, '0')}/${d.getUTCFullYear()}`,
            time: ag.hora || '00:00',
            service: ag.servico || 'Serviço',
            status: (ag.status || '').toLowerCase() === 'confirmado' ? 'confirmado' : 'pendente',
            day: d.getUTCDate(),
            month: d.getUTCMonth(),
            year: d.getUTCFullYear()
          };
        });
        setMonthData(filterByMonth(convertidos, month, year));
        setNotificacoes(convertidos.filter(a => a.status === 'pendente'));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const responderAgendamento = async (id: string, acao: 'aprovar' | 'rejeitar') => {
    try {
      const metodo = acao === 'aprovar' ? 'PUT' : 'DELETE';
      const res = await fetch(`${API_URL}/agendamentos/${id}/${acao}`, { method: metodo });
      if (res.ok) {
        setNotifVisible(false);
        buscarDoBanco();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      
      {/* 🟢 CABEÇALHO 100% LIVRE DE BLOQUEIOS (Sininho vai funcionar aqui) */}
      <View style={s.headerGlobalSimulado}>
         <View style={s.headerInner}>
            <Text style={s.urbanText}>Urban Book</Text>
            <View style={s.headerIcons}>
               <TouchableOpacity 
                 style={s.notifBtn} 
                 onPress={() => setNotifVisible(true)}
                 activeOpacity={0.5}
               >
                 <Text style={{ fontSize: 24 }}>🔔</Text>
                 {naoLidas > 0 && (
                   <View style={s.badge}><Text style={s.badgeText}>{naoLidas}</Text></View>
                 )}
               </TouchableOpacity>
               <Image source={logo} style={s.logoImage} />
            </View>
         </View>
      </View>

      <Modal visible={notifVisible} transparent animationType="fade">
        <Pressable style={s.modalOverlay} onPress={() => setNotifVisible(false)}>
          <View style={s.notifPanel}>
            <Text style={s.notifTitle}>Solicitações Pendentes</Text>
            {notificacoes.map(n => (
              <View key={n.id} style={s.notifItem}>
                <Text style={s.notifItemTitulo}>Solicitação de {n.name}</Text>
                <Text style={s.notifItemMsg}>{n.date} às {n.time}</Text>
                <View style={s.actionsRow}>
                  <TouchableOpacity style={s.btnAprovar} onPress={() => responderAgendamento(n.id, 'aprovar')}>
                    <Text style={s.btnTextNotif}>✓ Aprovar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.btnRecusar} onPress={() => responderAgendamento(n.id, 'rejeitar')}>
                    <Text style={s.btnTextNotif}>✕ Recusar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {notificacoes.length === 0 && <Text style={s.notifEmpty}>Nenhuma solicitação nova.</Text>}
          </View>
        </Pressable>
      </Modal>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitleMain}>Meus Atendimentos</Text>
        
        <View style={s.calendarCard}>
          {loading ? <ActivityIndicator color="#67C5C0" style={{ padding: 40 }} /> : (
            <Calendar 
              initialYear={INITIAL_YEAR} 
              initialMonth={INITIAL_MONTH} 
              selectedDay={selectedDay} 
              onSelectDay={(day) => setDay(day)} 
              onMonthChange={(m, y) => { setMonth(m); setYear(y); setDay(1); }} 
              confirmedDays={confirmedDays(monthData)} 
              pendingDays={pendingOnlyDays(monthData)} 
            />
          )}
        </View>

        <Text style={s.sectionTitle}>Atendimentos do dia {selectedDay}</Text>

        {monthData.filter(a => a.day === selectedDay).map(item => (
          <View key={item.id} style={s.card}>
            <View style={s.avatarCircle}><Text style={s.avatarInitial}>{item.name.charAt(0)}</Text></View>
            <View style={s.cardInfo}>
              <Text style={s.cardName}>{item.name}</Text>
              <Text style={s.cardDate}>{item.date} • {item.time}</Text>
              <Text style={[s.cardStatus, { color: item.status === 'confirmado' ? '#2DC26B' : '#F5A623' }]}>
                {item.status === 'confirmado' ? '✓ Confirmado' : '⏱ Pendente'}
              </Text>
            </View>
          </View>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  // PaddingTop ajustado para o cabeçalho novo não encostar no topo da tela do celular
  headerGlobalSimulado: { backgroundColor: '#fff', paddingTop: 45, paddingBottom: 10 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  urbanText: { fontSize: 30, fontWeight: 'bold', color: '#757575' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  logoImage: { width: 65, height: 60 },
  notifBtn: { width: 45, height: 45, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#E53935', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionTitleMain: { fontSize: 26, fontWeight: 'bold', color: '#111', marginTop: 10, marginBottom: 15 },
  calendarCard: { backgroundColor: '#fff', borderRadius: 16, padding: 8, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 15 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 15, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, alignItems: 'center' },
  avatarCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#67C5C0', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatarInitial: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700' },
  cardDate: { fontSize: 12, color: '#777', marginVertical: 2 },
  cardStatus: { fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  notifPanel: { backgroundColor: '#fff', borderRadius: 16, width: '85%', padding: 20 },
  notifTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  notifItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  notifItemTitulo: { fontWeight: '700', fontSize: 14 },
  notifItemMsg: { fontSize: 13, color: '#666', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btnAprovar: { backgroundColor: '#2DC26B', padding: 8, borderRadius: 6, flex: 1, alignItems: 'center' },
  btnRecusar: { backgroundColor: '#E53935', padding: 8, borderRadius: 6, flex: 1, alignItems: 'center' },
  btnTextNotif: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  notifEmpty: { textAlign: 'center', padding: 20, color: '#999' }
});