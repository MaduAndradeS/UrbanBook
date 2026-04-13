import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, TouchableOpacity, ActivityIndicator,
  Modal, Pressable,
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
  month: number;
  year: number;
}

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  hora: string;
  lida: boolean;
}

// ─── MOCK DATA ────────────────────────────────────────────────
const MOCK_DATA: Appointment[] = [
  {
    id: '1', name: 'Pedro Cardoso', date: 'Quarta, 10 Mar',
    time: '10:00 - 11:00', service: 'Hidratação e corte de cabelo',
    status: 'confirmado', day: 10, month: 2, year: 2025,
  },
  {
    id: '2', name: 'João Vitor Minelli', date: 'Quarta, 10 Mar',
    time: '13:00 - 14:00', service: 'Corte de Cabelo',
    status: 'confirmado', day: 10, month: 2, year: 2025,
  },
  {
    id: '3', name: 'Ana Lima', date: 'Sexta, 14 Mar',
    time: '15:00 - 16:00', service: 'Escova progressiva',
    status: 'pendente', day: 14, month: 2, year: 2025,
  },
];

const MOCK_NOTIFICACOES: Notificacao[] = [
  {
    id: '1', titulo: 'Novo agendamento',
    mensagem: 'Pedro Cardoso agendou um horário para 10/03 às 10:00.',
    hora: '08:30', lida: false,
  },
  {
    id: '2', titulo: 'Agendamento confirmado',
    mensagem: 'João Vitor Minelli confirmou presença para 10/03 às 13:00.',
    hora: '09:15', lida: false,
  },
  {
    id: '3', titulo: 'Lembrete',
    mensagem: 'Você tem 2 atendimentos amanhã. Prepare-se!',
    hora: 'Ontem', lida: true,
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
  return data.filter(a => a.status === 'pendente' && !confirmed.has(a.day)).map(a => a.day);
}

// ─── TELA ─────────────────────────────────────────────────────
const INITIAL_YEAR  = 2025;
const INITIAL_MONTH = 2;

export default function AtendimentosScreen() {
  const [year, setYear]             = useState(INITIAL_YEAR);
  const [month, setMonth]           = useState(INITIAL_MONTH);
  const [selectedDay, setDay]       = useState(10);
  const [monthData, setMonthData]   = useState<Appointment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(MOCK_NOTIFICACOES);

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  useEffect(() => {
    setLoading(true);
    const data = filterByMonth(MOCK_DATA, month, year);
    setMonthData(data);
    setLoading(false);
  }, [month, year]);

  const handleMonthChange = (m: number, y: number) => {
    setMonth(m); setYear(y); setDay(1);
  };

  const marcarTodasLidas = () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const dayAppointments = monthData.filter(a => a.day === selectedDay);

  return (
    <SafeAreaView style={s.safeArea}>

      {/* ── Painel de Notificações (Modal) ── */}
      <Modal
        visible={notifVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotifVisible(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setNotifVisible(false)}>
          {/* Impede que o toque dentro do painel feche o modal */}
          <Pressable style={s.notifPanel} onPress={() => {}}>
            <View style={s.notifHeader}>
              <Text style={s.notifTitle}>Notificações</Text>
              {naoLidas > 0 && (
                <TouchableOpacity onPress={marcarTodasLidas}>
                  <Text style={s.notifMarkAll}>Marcar todas como lidas</Text>
                </TouchableOpacity>
              )}
            </View>

            {notificacoes.map(n => (
              <TouchableOpacity
                key={n.id}
                style={[s.notifItem, !n.lida && s.notifItemUnread]}
                activeOpacity={0.8}
                onPress={() =>
                  setNotificacoes(prev =>
                    prev.map(x => x.id === n.id ? { ...x, lida: true } : x)
                  )
                }
              >
                <View style={s.notifItemLeft}>
                  {!n.lida && <View style={s.notifDot} />}
                </View>
                <View style={s.notifItemBody}>
                  <View style={s.notifItemTop}>
                    <Text style={s.notifItemTitulo}>{n.titulo}</Text>
                    <Text style={s.notifItemHora}>{n.hora}</Text>
                  </View>
                  <Text style={s.notifItemMsg}>{n.mensagem}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {notificacoes.length === 0 && (
              <Text style={s.notifEmpty}>Nenhuma notificação.</Text>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.topHeader}>
          <Text style={s.brandName}>Urban Book</Text>
          <View style={s.headerIcons}>

            {/* Sininho */}
            <TouchableOpacity style={s.iconBtn} onPress={() => setNotifVisible(true)}>
              <Text style={s.iconBtnText}>🔔</Text>
              {naoLidas > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{naoLidas}</Text>
                </View>
              )}
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

        {/* Atendimentos do dia */}
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
              <Text style={[s.cardStatus, { color: item.status === 'confirmado' ? '#2DC26B' : '#F5A623' }]}>
                {item.status === 'confirmado' ? '✓  Confirmado' : '⏱  Pendente'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
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

  // Badge vermelho no sininho
  badge: {
    position: 'absolute', top: -5, right: -5,
    backgroundColor: '#E53935', borderRadius: 8,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

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

  // ── Modal de notificações ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start', alignItems: 'flex-end',
    paddingTop: 70, paddingRight: 16,
  },
  notifPanel: {
    backgroundColor: '#fff', borderRadius: 16, width: 300,
    paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  notifHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 8,
  },
  notifTitle:   { fontSize: 15, fontWeight: '700', color: '#111' },
  notifMarkAll: { fontSize: 11, color: '#67C5C0', fontWeight: '600' },

  notifItem: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  notifItemUnread: { backgroundColor: '#f5fffe' },
  notifItemLeft:   { width: 16, alignItems: 'center', paddingTop: 4 },
  notifDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#67C5C0',
  },
  notifItemBody:  { flex: 1 },
  notifItemTop:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  notifItemTitulo:{ fontSize: 13, fontWeight: '700', color: '#111', flex: 1 },
  notifItemHora:  { fontSize: 11, color: '#aaa', marginLeft: 8 },
  notifItemMsg:   { fontSize: 12, color: '#666', lineHeight: 17 },

  notifEmpty: { textAlign: 'center', color: '#aaa', padding: 20, fontSize: 13 },
});
