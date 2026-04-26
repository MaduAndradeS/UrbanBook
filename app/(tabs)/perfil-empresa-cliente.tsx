import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API_URL = 'http://192.168.0.225:3333/api';

export default function PerfilEmpresaCliente() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const idBuscado = id || 5; 

  const [empresa, setEmpresa] = useState<any>(null);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resPerfil, resAgenda] = await Promise.all([
          fetch(`${API_URL}/empresarios/${idBuscado}`),
          fetch(`${API_URL}/empresarios/${idBuscado}/disponibilidade`)
        ]);

        if (resPerfil.ok) {
          const data = await resPerfil.json();
          setEmpresa(data);
        }

        if (resAgenda.ok) {
          const dataAgenda = await resAgenda.json();
          setAgenda(Array.isArray(dataAgenda) ? dataAgenda : []);
        }
      } catch (error) {
        console.log('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [idBuscado]);

  const handleConfirmarAgendamento = (horario: string, dia: string) => {
    Alert.alert(
      "Confirmar Agendamento",
      `Deseja solicitar um agendamento para ${dia} às ${horario}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: () => {
          setModalVisivel(false);
          Alert.alert("Sucesso!", "Sua solicitação foi enviada ao profissional.");
        }}
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#67C5C0" />
      </SafeAreaView>
    );
  }

  if (!empresa) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Profissional não encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header - Limpo sem curtidas */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={30} color="#333" />
          </TouchableOpacity>
          
          <Image 
            source={{ uri: empresa.FOTO_PERFIL || 'https://via.placeholder.com/150' }} 
            style={styles.logo} 
          />
          
          {/* Espaço vazio para manter o alinhamento central da logo */}
          <View style={{ width: 45 }} />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.title}>{empresa.NOME}</Text>
          <View style={styles.ratingBadge}><Text style={styles.ratingText}>★ 5</Text></View>
        </View>

        {/* Botão de Agendamento Principal */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButtonFull} 
            onPress={() => setModalVisivel(true)}
          >
            <MaterialCommunityIcons name="calendar-check" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Agendar Horário</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Sobre</Text>
        <View style={styles.box}>
          <Text style={styles.boxText}>{empresa.BIO || 'Sem descrição.'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Serviços</Text>
        <View style={styles.tagsRow}>
          {empresa.SERVICOS?.map((s: any, i: number) => (
            <View key={i} style={styles.tag}><Text style={styles.tagText}>{s.NOME}</Text></View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Portfólio</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {empresa.FOTO_TRABALHO?.map((f: any, i: number) => (
            <Image key={i} source={{ uri: f.URL }} style={styles.foto} />
          ))}
        </ScrollView>
      </ScrollView>

      {/* Modal de Horários */}
      <Modal visible={modalVisivel} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Horários Disponíveis</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {agenda.length > 0 ? (
                agenda.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.agendaItem}
                    onPress={() => handleConfirmarAgendamento(item.PERIODOS, item.DIAS_ATIVOS)}
                  >
                    <View style={styles.diaBadge}>
                      <Text style={styles.diaBadgeText}>{item.DIAS_ATIVOS}</Text>
                    </View>
                    <Text style={styles.horarioText}>{item.PERIODOS}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#67C5C0" />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.vazioText}>Este profissional ainda não disponibilizou horários.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee' },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111', flex: 1 },
  ratingBadge: { backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontWeight: 'bold' },
  
  actionButtons: { marginBottom: 20 },
  actionButtonFull: { 
    flexDirection: 'row',
    backgroundColor: '#67C5C0', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  box: { padding: 15, borderRadius: 12, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee' },
  boxText: { color: '#666', lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  tag: { backgroundColor: '#67C5C0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  tagText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  foto: { width: 200, height: 130, borderRadius: 12, marginRight: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  agendaItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  diaBadge: { backgroundColor: '#67C5C0', padding: 6, borderRadius: 8, marginRight: 15 },
  diaBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  horarioText: { flex: 1, fontWeight: '600', color: '#444' },
  vazioText: { textAlign: 'center', color: '#999', marginVertical: 20 }
});