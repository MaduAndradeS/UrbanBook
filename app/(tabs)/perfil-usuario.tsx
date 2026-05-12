import logo from '@/assets/images/logo.png';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { API_URL } from '../../config/api';

export default function PerfilUsuarioScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [enderecos, setEnderecos] = useState<any[]>([]);
  const [proximoAgendamento, setProximoAgendamento] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [modalEnderecoVisible, setModalEnderecoVisible] = useState(false);
  const [salvandoDados, setSalvandoDados] = useState(false);

  const [editNome, setEditNome] = useState('');
  const [editTelefone, setEditTelefone] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const idSalvo = await AsyncStorage.getItem('id_usuario');
      if (!idSalvo) {
        router.replace('/');
        return;
      }

      // 1. Carrega os dados do Cliente
      try {
        const resCliente = await fetch(`${API_URL}/clientes/${idSalvo}`);
        if (resCliente.ok) {
          const dataCliente = await resCliente.json();
          setNome(dataCliente.NOME || '');
          setFotoPerfil(dataCliente.FOTO_PERFIL || null);
          setEmail(dataCliente.EMAIL || '');
          if (dataCliente.TELEFONE?.length > 0) setTelefone(dataCliente.TELEFONE[0].TELEFONE);
          if (dataCliente.ENDERECO) setEnderecos(dataCliente.ENDERECO);
        }
      } catch (error) {
        console.log('Erro ao buscar perfil:', error);
      }

      setLoading(false);

      // 2. Carrega o Próximo Agendamento convertendo os dados novos do Prisma
      try {
        const resAgendamentos = await fetch(`${API_URL}/agendamentos/cliente/${idSalvo}`);
        if (resAgendamentos.ok) {
          const dataAg = await resAgendamentos.json();
          
          // Ignora os cancelados
          const validos = Array.isArray(dataAg) ? dataAg.filter(a => a.CANCELAMENTO !== true) : [];
          
          if (validos.length > 0) {
            const ag = validos[0]; // Pega o primeiro
            
            let dateFmt = 'Sem Data';
            let timeFmt = '00:00';
            
            // Extrai a data e a hora separadas
            if (ag.DATA_HORA) {
               const dObj = new Date(ag.DATA_HORA);
               dateFmt = `${String(dObj.getDate()).padStart(2, '0')}/${String(dObj.getMonth() + 1).padStart(2, '0')}/${dObj.getFullYear()}`;
               timeFmt = `${String(dObj.getHours()).padStart(2, '0')}:${String(dObj.getMinutes()).padStart(2, '0')}`;
            }

            setProximoAgendamento({
              empresa: ag.EMPRESARIO?.NOME || 'Profissional',
              data: dateFmt,
              hora: timeFmt,
              status: ag.CONFIRMACAO ? 'Confirmado' : 'Pendente'
            });
          } else {
            setProximoAgendamento(null);
          }
        }
      } catch (error) {
        console.log('Erro ao buscar agendamentos:', error);
      }

    } catch (error) {
      console.log('Erro geral:', error);
      setLoading(false);
    }
  }

  const handleTrocarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        const idSalvo = await AsyncStorage.getItem('id_usuario');
        const filename = result.assets[0].uri.split('/').pop();
        const formData = new FormData();
        formData.append('id', String(idSalvo));
        formData.append('foto', { uri: result.assets[0].uri, name: filename, type: 'image/jpeg' } as any);

        const response = await fetch(`${API_URL}/clientes/perfil/foto`, {
          method: 'PATCH',
          body: formData,
        });

        const data = await response.json();
        if (response.ok) setFotoPerfil(data.FOTO_PERFIL);
      } catch (error) {
        Alert.alert('Erro', 'Erro no servidor ao enviar foto.');
      } finally {
        setUploading(false);
      }
    }
  };

  async function salvarDadosPessoais() {
    setSalvandoDados(true);
    try {
      const idSalvo = await AsyncStorage.getItem('id_usuario');
      const response = await fetch(`${API_URL}/clientes/${idSalvo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: editNome, telefone: editTelefone })
      });

      if (response.ok) {
        setNome(editNome);
        setTelefone(editTelefone);
        Alert.alert('Sucesso', 'Dados atualizados!');
        setModalEditarVisible(false);
      } else {
        Alert.alert('Erro', 'Verifique o terminal do servidor.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setSalvandoDados(false);
    }
  }

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja terminar sessão?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await AsyncStorage.clear(); router.replace('/'); } },
    ]);
  };

  if (loading) return <View style={s.loadingCenter}><ActivityIndicator size="large" color="#67C5C0" /></View>;

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.profile}>
          <View style={s.avatarContainer}>
            <Image source={{ uri: fotoPerfil || 'https://via.placeholder.com/150' }} style={s.avatar} />
            <TouchableOpacity style={s.cameraBtn} onPress={handleTrocarFoto} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#fff" size="small" /> : <MaterialCommunityIcons name="camera" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
          <Text style={s.name}>{nome || 'Carregando...'}</Text>
          <Text style={s.emailText}>{email}</Text>
        </View>

        <View style={s.divider} />

        <Text style={s.sectionTitle}>Próximo agendamento</Text>
        {proximoAgendamento ? (
          <TouchableOpacity style={s.agendamentoCard} onPress={() => router.push('/(tabs)/agendamentos')}>
            <View style={s.agendamentoIcone}><MaterialCommunityIcons name="calendar-clock" size={28} color="#67C5C0" /></View>
            <View style={s.agendamentoInfo}>
              <Text style={s.agendamentoEmpresa}>{proximoAgendamento.empresa}</Text>
              <Text style={s.agendamentoData}>{proximoAgendamento.data} às {proximoAgendamento.hora}</Text>
              <Text style={[s.agendamentoStatus, { color: proximoAgendamento.status === 'Confirmado' ? '#2DC26B' : '#F5A623' }]}>
                Status: {proximoAgendamento.status}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        ) : (
          <View style={s.semAgendamentoBox}><Text style={s.semAgendamentoText}>Nenhum agendamento futuro.</Text></View>
        )}

        <View style={s.divider} />
        <Text style={s.sectionTitle}>Opções da Conta</Text>
        
        <TouchableOpacity style={s.menuItem} onPress={() => { setEditNome(nome); setEditTelefone(telefone); setModalEditarVisible(true); }}>
          <MaterialCommunityIcons name="account-edit-outline" size={24} color="#555" />
          <Text style={s.menuText}>Editar dados pessoais</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.menuItem} onPress={() => setModalEnderecoVisible(true)}>
          <MaterialCommunityIcons name="map-marker-outline" size={24} color="#555" />
          <Text style={s.menuText}>Meus endereços</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={s.logoutBtnText}>Sair da Conta</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL EDITAR DADOS */}
      <Modal visible={modalEditarVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Editar Perfil</Text>
            
            <Text style={s.inputLabel}>Nome completo</Text>
            <TextInput style={s.input} value={editNome} onChangeText={setEditNome} />

            <Text style={s.inputLabel}>Telefone</Text>
            <TextInput style={s.input} value={editTelefone} onChangeText={setEditTelefone} keyboardType="phone-pad" />

            <View style={s.infoEmailBox}>
              <Text style={s.infoEmailText}>O e-mail ({email}) não pode ser alterado por segurança.</Text>
            </View>

            <TouchableOpacity style={s.btnSalvar} onPress={salvarDadosPessoais} disabled={salvandoDados}>
              {salvandoDados ? <ActivityIndicator color="#fff" /> : <Text style={s.btnSalvarText}>Salvar Alterações</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity style={s.btnCancelar} onPress={() => setModalEditarVisible(false)}>
              <Text style={s.btnCancelarText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL ENDEREÇOS */}
      <Modal visible={modalEnderecoVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeaderRow}>
              <Text style={s.modalTitle}>Meus Endereços</Text>
              <TouchableOpacity onPress={() => setModalEnderecoVisible(false)}><MaterialCommunityIcons name="close" size={26} color="#333" /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {enderecos.length > 0 ? enderecos.map((end, index) => (
                <View key={index} style={s.enderecoCard}>
                  <MaterialCommunityIcons name="map-marker" size={24} color="#67C5C0" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.enderecoRua}>{end.RUA}, {end.NUM}</Text>
                    <Text style={s.enderecoDetalhes}>{end.BAIRRO} - {end.CIDADE}/{end.ESTADO}</Text>
                  </View>
                </View>
              )) : <Text style={s.semEnderecoText}>Nenhum endereço cadastrado.</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  profile: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#67C5C0' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 5, backgroundColor: '#333', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  name: { fontWeight: 'bold', fontSize: 22, marginTop: 15, color: '#333' },
  emailText: { fontSize: 14, color: '#777', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 15, marginTop: 10 },
  agendamentoCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#eaeaea' },
  agendamentoIcone: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#E8F5F5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  agendamentoInfo: { flex: 1 },
  agendamentoEmpresa: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  agendamentoData: { fontSize: 14, color: '#555', marginTop: 2 },
  agendamentoStatus: { fontSize: 12, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' },
  semAgendamentoBox: { padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10, alignItems: 'center' },
  semAgendamentoText: { color: '#777', fontStyle: 'italic' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuText: { fontSize: 16, marginLeft: 15, color: '#444' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#ff4d4d', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  logoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 25 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  inputLabel: { fontSize: 14, color: '#555', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 15, color: '#333', marginBottom: 15 },
  infoEmailBox: { padding: 10, backgroundColor: '#fff3cd', borderRadius: 8, marginBottom: 15 },
  infoEmailText: { fontSize: 12, color: '#856404', textAlign: 'center' },
  btnSalvar: { backgroundColor: '#67C5C0', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnSalvarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnCancelar: { paddingVertical: 14, alignItems: 'center', marginTop: 5 },
  btnCancelarText: { color: '#888', fontWeight: 'bold', fontSize: 16 },
  enderecoCard: { flexDirection: 'row', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  enderecoRua: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  enderecoDetalhes: { fontSize: 13, color: '#666' },
  semEnderecoText: { textAlign: 'center', color: '#888', marginTop: 20 }
});