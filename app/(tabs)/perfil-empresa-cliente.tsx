import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

export default function PerfilEmpresaCliente() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [idBuscado, setIdBuscado] = useState<number | null>(null);
  const [empresa, setEmpresa] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalFotoVisivel, setModalFotoVisivel] = useState(false);
  const [fotoSelecionada, setFotoSelecionada] = useState('');

  // 🔹 DEFINIR ID (rota ou usuário logado)
  useEffect(() => {
    async function pegarId() {
      if (id) {
        setIdBuscado(Number(id));
        return;
      }

      const idSalvo = await AsyncStorage.getItem('id_usuario');
      if (idSalvo) {
        setIdBuscado(Number(idSalvo));
      }
    }

    pegarId();
  }, [id]);

  // 🔹 CARREGAR DADOS
  useEffect(() => {
    if (!idBuscado) return;

    async function carregarDados() {
      try {
        const resPerfil = await fetch(`${API_URL}/empresarios/${idBuscado}`);

        if (resPerfil.ok) {
          const data = await resPerfil.json();
          setEmpresa(data);
        }
      } catch (error) {
        console.log('Erro ao carregar dados do perfil:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [idBuscado]);

  const abrirFoto = (url: string) => {
    setFotoSelecionada(url);
    setModalFotoVisivel(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#67C5C0" />
      </View>
    );
  }

  if (!empresa) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Profissional não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={30} color="#333" />
          </TouchableOpacity>
          
          <Image 
            source={{ uri: empresa.FOTO_PERFIL || 'https://via.placeholder.com/150' }} 
            style={styles.logo} 
          />
          
          <View style={{ width: 45 }} />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.title}>{empresa.NOME}</Text>
        </View>

        <View style={styles.actionButtons}>
          {/* 🟢 ROTA PARA A PÁGINA DA DUDINHA PASSANDO O ID */}
          <TouchableOpacity 
            style={styles.actionButtonFull} 
            onPress={() => router.push(`/Cliente_Datas?id=${idBuscado}`)}
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
            <TouchableOpacity key={i} onPress={() => abrirFoto(f.URL)}>
              <Image source={{ uri: f.URL }} style={styles.foto} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Modal de Foto Ampliada */}
      <Modal visible={modalFotoVisivel} transparent={true} animationType="fade">
        <View style={styles.modalFotoOverlay}>
          <TouchableOpacity 
            style={styles.fecharFotoBtn} 
            onPress={() => setModalFotoVisivel(false)}
          >
            <MaterialCommunityIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          
          {fotoSelecionada ? (
            <Image 
              source={{ uri: fotoSelecionada }} 
              style={styles.fotoAmpliada} 
              resizeMode="contain" 
            />
          ) : null}
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 15 }, 
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  backButton: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee' },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111', textAlign: 'center' },
  
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

  // Estilos da Foto Ampliada
  modalFotoOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.9)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  fecharFotoBtn: { 
    position: 'absolute', 
    top: 50, 
    right: 20, 
    zIndex: 10, 
    padding: 10 
  },
  fotoAmpliada: { 
    width: '100%', 
    height: '80%' 
  }
});