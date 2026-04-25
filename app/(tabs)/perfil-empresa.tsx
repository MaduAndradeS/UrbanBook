import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Configurações de Conexão
import { API_URL } from '../../config/api';
const ID_EMPRESARIO_ATUAL = 5;

export default function PerfilEmpresa() {
  const router = useRouter(); 

  // ESTADOS DO PERFIL
  const [perfilImg, setPerfilImg] = useState('https://via.placeholder.com/150');
  const [nomeEmpresario, setNomeEmpresario] = useState('Carregando...');
  const [bio, setBio] = useState('Buscando informações...');
  const [telefone, setTelefone] = useState('Não informado');
  const [endereco, setEndereco] = useState('Endereço não cadastrado');
  const [servicos, setServicos] = useState<any[]>([]);
  const [fotosTrabalho, setFotosTrabalho] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);

  // ESTADOS DE CONTROLE
  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);

  // 1. CARREGAMENTO DOS DADOS
  const carregarDados = async () => {
    try {
      const [resPerfil, resAgenda] = await Promise.all([
        fetch(`${API_URL}/empresarios/${ID_EMPRESARIO_ATUAL}`),
        fetch(`${API_URL}/empresarios/${ID_EMPRESARIO_ATUAL}/disponibilidade`)
      ]);

      if (resPerfil.ok) {
        const data = await resPerfil.json();
        if (data.FOTO_PERFIL) setPerfilImg(data.FOTO_PERFIL);
        if (data.NOME) setNomeEmpresario(data.NOME);
        if (data.BIO) setBio(data.BIO);
        if (data.TELEFONE?.length > 0) setTelefone(data.TELEFONE[0].TELEFONE);
        if (data.ENDERECO?.length > 0) {
          const end = data.ENDERECO[0];
          setEndereco(`${end.RUA}, ${end.NUM} - ${end.BAIRRO}, ${end.CIDADE}`);
        }
        if (data.SERVICOS) setServicos(data.SERVICOS);
        if (data.FOTO_TRABALHO) setFotosTrabalho(data.FOTO_TRABALHO);
      }

      if (resAgenda.ok) {
        const dataAgenda = await resAgenda.json();
        const lista = Array.isArray(dataAgenda) ? dataAgenda : (dataAgenda.disponibilidade || []);
        setAgenda(lista);
      }
    } catch (error) {
      console.error('Erro na carga inicial:', error);
    } finally {
      setLoadingInicial(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // 2. ATUALIZAR FOTO DE PERFIL
  const handleEditPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLoading(true);
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const formData = new FormData();
      formData.append('id', String(ID_EMPRESARIO_ATUAL));
      formData.append('foto', { uri: localUri, name: filename || 'upload.jpg', type: type } as any);

      try {
        const response = await fetch(`${API_URL}/empresarios/perfil/foto`, {
          method: 'PATCH',
          body: formData,
        });

        const data = await response.json();
        if (response.ok && data.FOTO_PERFIL) {
          setPerfilImg(data.FOTO_PERFIL);
          Alert.alert('Sucesso', 'Sua foto de perfil foi atualizada!');
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível enviar a foto.');
      } finally {
        setLoading(false);
      }
    }
  };

  // 3. ADICIONAR FOTO AO PORTFÓLIO
  const handleAddPortfolioPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLoading(true);
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const formData = new FormData();
      formData.append('id_empresario', String(ID_EMPRESARIO_ATUAL));
      formData.append('foto', { uri: localUri, name: filename || 'portfolio.jpg', type: type } as any);

      try {
        const response = await fetch(`${API_URL}/empresarios/trabalhos/fotos`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        if (response.ok) {
          const novaFoto = data.foto || data;
          setFotosTrabalho(prev => [...prev, novaFoto]);
          Alert.alert('Sucesso', 'Foto adicionada ao portfólio!');
        }
      } catch (error) { 
        Alert.alert('Erro', 'O servidor não respondeu.');
      } finally { 
        setLoading(false); 
      }
    }
  };

  if (loadingInicial) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#67C5C0" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={s.container}>
        
        {/* CABEÇALHO */}
        <View style={s.header}>
          <View style={s.logoContainer}>
            <Image source={{ uri: perfilImg }} style={s.logoImg} />
            {loading ? (
              <View style={s.loadingOverlay}><ActivityIndicator color="white" /></View>
            ) : (
              <TouchableOpacity style={s.editBtn} onPress={handleEditPhoto}>
                <MaterialCommunityIcons name="camera-plus" size={22} color="white" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={s.empresaNome}>{nomeEmpresario}</Text>
          <View style={s.phoneRow}>
            <MaterialCommunityIcons name="phone" size={18} color="#fff" />
            <Text style={s.phoneText}>{telefone}</Text>
          </View>
        </View>

        <View style={s.content}>
          
          <TouchableOpacity 
            style={s.agendaBtn} 
            onPress={() => router.push('/Emp_Dispo')}
          >
            <MaterialCommunityIcons name="calendar-clock" size={24} color="#fff" />
            <Text style={s.agendaBtnText}>Disponibilizar Horários</Text>
          </TouchableOpacity>

          <View style={s.listaAgendaContainer}>
            {agenda.length > 0 && (
               <Text style={[s.sectionTitle, { marginBottom: 10 }]}>Seus Horários Atuais</Text>
            )}
            {agenda.map((item, index) => (
              <View key={item.ID_DISP || index} style={s.agendaCard}>
                <View style={s.diaBadge}>
                  <Text style={s.diaBadgeText}>{item.DIAS_ATIVOS}</Text>
                </View>
                <Text style={s.horarioText}>{item.PERIODOS}</Text>
              </View>
            ))}
          </View>

          <View style={s.divider} />

          {/* LOCALIZAÇÃO (CORRIGIDA) */}
          <Text style={s.sectionTitle}>Localização</Text>
          <View style={s.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#008080" />
            <Text style={s.infoText}>{endereco}</Text>
          </View>

          <View style={s.divider} />

          <Text style={s.sectionTitle}>Serviços Oferecidos</Text>
          <View style={s.servicosContainer}>
            {servicos.map((servico, index) => (
              <View key={index} style={s.servicoTag}>
                <MaterialCommunityIcons name="tools" size={16} color="#008080" style={{ marginRight: 5 }} />
                <Text style={s.servicoTexto}>{servico.NOME}</Text>
              </View>
            ))}
          </View>

          <View style={s.divider} />

          <Text style={s.sectionTitle}>Sobre o seu negócio</Text>
          <Text style={s.description}>{bio}</Text>

          <View style={s.divider} />

          <View style={s.portfolioHeader}>
            <Text style={s.sectionTitle}>Fotos do Trabalho</Text>
            <TouchableOpacity style={s.addPhotoBtn} onPress={handleAddPortfolioPhoto}>
              <MaterialCommunityIcons name="plus" size={18} color="#008080" />
              <Text style={s.addPhotoText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          <View style={s.portfolioContainer}>
            {fotosTrabalho.map((foto, index) => (
              <Image 
                key={index} 
                source={{ uri: foto.URL || foto.url }} 
                style={s.portfolioImg} 
                resizeMode="cover"
              />
            ))}
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#67C5C0', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  logoContainer: { position: 'relative' },
  logoImg: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#fff', backgroundColor: '#e1e4e8' },
  editBtn: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#FFB800', padding: 10, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 70, justifyContent: 'center', alignItems: 'center' },
  empresaNome: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, opacity: 0.9 },
  phoneText: { color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: '500' },
  content: { padding: 20 },
  agendaBtn: { flexDirection: 'row', backgroundColor: '#FFB800', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 5, elevation: 3 },
  agendaBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  listaAgendaContainer: { marginTop: 25 },
  agendaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  diaBadge: { backgroundColor: '#67C5C0', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, marginRight: 10 },
  diaBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  horarioText: { color: '#444', fontSize: 14, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  infoText: { fontSize: 15, color: '#666', marginLeft: 8, flex: 1 },
  servicosContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  servicoTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5F5', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#B2DFDB' },
  servicoTexto: { color: '#008080', fontWeight: 'bold', fontSize: 13 },
  description: { fontSize: 15, color: '#666', lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 20 },
  portfolioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  addPhotoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: '#B2DFDB' },
  addPhotoText: { color: '#008080', fontWeight: 'bold', fontSize: 13, marginLeft: 4 },
  portfolioContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  portfolioImg: { width: 100, height: 100, borderRadius: 8, marginBottom: 10, marginRight: 10, backgroundColor: '#eee' },
});