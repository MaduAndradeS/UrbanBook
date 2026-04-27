import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; // Adicionado
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

import { API_URL } from '../../config/api';

export default function PerfilEmpresa() {
  const router = useRouter();

  // ESTADOS DO PERFIL
  const [perfilImg, setPerfilImg] = useState('https://via.placeholder.com/150');
  const [nomeEmpresario, setNomeEmpresario] = useState('Carregando...');
  const [bio, setBio] = useState('');
  const [telefone, setTelefone] = useState('Não informado');
  const [endereco, setEndereco] = useState('Endereço não cadastrado');
  const [servicos, setServicos] = useState<any[]>([]);
  const [fotosTrabalho, setFotosTrabalho] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);

  // CONTROLE
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [loadingUpload, setLoadingUpload] = useState(false); // Novo estado para feedback de upload

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const idSalvo = await AsyncStorage.getItem('id_usuario');

        if (!isMounted) return;

        if (!idSalvo) {
          router.replace('/');
          return;
        }

        const id = Number(idSalvo);

        const [resP, resA] = await Promise.all([
          fetch(`${API_URL}/empresarios/${id}`),
          fetch(`${API_URL}/empresarios/${id}/disponibilidade`)
        ]);

        if (!isMounted) return;

        const dataP = await resP.json();

        if (resP.ok) {
          setNomeEmpresario(dataP.NOME || 'Empresário');
          setBio(dataP.BIO || '');
          if (dataP.FOTO_PERFIL) setPerfilImg(dataP.FOTO_PERFIL);
          if (dataP.TELEFONE?.length > 0) setTelefone(dataP.TELEFONE[0].TELEFONE);
          if (dataP.ENDERECO?.length > 0) {
            const e = dataP.ENDERECO[0];
            setEndereco(`${e.RUA}, ${e.NUM} - ${e.BAIRRO}`);
          }
          setServicos(dataP.SERVICOS || []);
          setFotosTrabalho(dataP.FOTO_TRABALHO || []);
        }

        if (resA.ok) {
          const dataA = await resA.json();
          setAgenda(Array.isArray(dataA) ? dataA : []);
        }

      } catch (e) {
        console.log(e);
      } finally {
        if (isMounted) setLoadingInicial(false);
      }
    }

    init();
    return () => { isMounted = false; };
  }, []);

  //  LOGICA DE UPLOAD (Integrada do Pedro com IDs dinâmicos)
  const handleEditPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos.");
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLoadingUpload(true);
      try {
        const idSalvo = await AsyncStorage.getItem('id_usuario');
        const localUri = result.assets[0].uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const formData = new FormData();
        formData.append('id', String(idSalvo));
        formData.append('foto', { uri: localUri, name: filename || 'upload.jpg', type: type } as any);

        const response = await fetch(`${API_URL}/empresarios/perfil/foto`, {
          method: 'PATCH',
          body: formData,
        });

        const data = await response.json();
        if (response.ok && data.FOTO_PERFIL) {
          setPerfilImg(data.FOTO_PERFIL);
          Alert.alert('Sucesso', 'Foto de perfil atualizada!');
        }
      } catch (error) {
        Alert.alert('Erro', 'Erro ao enviar foto.');
      } finally {
        setLoadingUpload(false);
      }
    }
  };

  const handleAddPortfolioPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLoadingUpload(true);
      try {
        const idSalvo = await AsyncStorage.getItem('id_usuario');
        const localUri = result.assets[0].uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const formData = new FormData();
        formData.append('id_empresario', String(idSalvo));
        formData.append('foto', { uri: localUri, name: filename || 'portfolio.jpg', type: type } as any);

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
        Alert.alert('Erro', 'Não foi possível adicionar a foto.');
      } finally {
        setLoadingUpload(false);
      }
    }
  };

  //  EXCLUIR HORÁRIO 
  const handleExcluirHorario = async (idDisp: number) => {
    Alert.alert("Excluir", "Deseja apagar este horário?", [
      { text: "Cancelar" },
      {
        text: "Sim",
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/empresarios/disponibilidade/${idDisp}`, { method: 'DELETE' });
            if (res.ok) {
              setAgenda(prev => prev.filter(a => a.ID_DISP !== idDisp));
            }
          } catch (e) {
            console.log(e);
          }
        }
      }
    ]);
  };

  if (loadingInicial) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#67C5C0" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={{ uri: perfilImg }} style={styles.logoImg} />
            <TouchableOpacity 
                style={styles.editBtn} 
                onPress={handleEditPhoto}
                disabled={loadingUpload}
            >
              {loadingUpload ? (
                  <ActivityIndicator color="white" size="small" />
              ) : (
                  <MaterialCommunityIcons name="camera-plus" size={22} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.empresaNome}>{nomeEmpresario}</Text>

          <View style={styles.phoneRow}>
            <MaterialCommunityIcons name="phone" size={18} color="#fff" />
            <Text style={styles.phoneText}>{telefone}</Text>
          </View>
        </View>

        {/* CONTEÚDO */}
        <View style={styles.content}>

          <TouchableOpacity
            style={styles.agendaBtn}
            onPress={() => router.push('/Emp_Dispo')}
          >
            <MaterialCommunityIcons name="calendar-clock" size={24} color="#fff" />
            <Text style={styles.agendaBtnText}>Novo Horário de Atendimento</Text>
          </TouchableOpacity>

          {/* AGENDA */}
          <View style={styles.listaAgendaContainer}>
            {agenda.map((item, i) => (
              <View key={i} style={styles.agendaCard}>
                <View style={styles.agendaInfo}>
                  <View style={styles.diaBadge}>
                    <Text style={styles.diaBadgeText}>{item.DIAS_ATIVOS}</Text>
                  </View>
                  <Text style={styles.horarioText}>{item.PERIODOS}</Text>
                </View>

                <TouchableOpacity onPress={() => handleExcluirHorario(item.ID_DISP)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ff4d4d" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Localização</Text>
          <Text style={styles.infoText}>{endereco}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Serviços</Text>
          <View style={styles.servicosContainer}>
            {servicos.map((s, i) => (
              <View key={i} style={styles.servicoTag}>
                <Text style={styles.servicoTexto}>{s.NOME}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.description}>{bio}</Text>

          <View style={styles.divider} />

          {/* PORTFÓLIO COM BOTÃO ADICIONAR */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>Portfólio</Text>
            <TouchableOpacity onPress={handleAddPortfolioPhoto} style={styles.addBtnSmall}>
                <MaterialCommunityIcons name="plus" size={20} color="#008080" />
                <Text style={styles.addBtnTextSmall}>Adicionar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.portfolioContainer}>
            {fotosTrabalho.map((f, i) => (
              <Image key={i} source={{ uri: f.URL || f.url }} style={styles.portfolioImg} />
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#67C5C0', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  logoContainer: { position: 'relative' },
  logoImg: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#fff' },
  editBtn: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#FFB800', padding: 10, borderRadius: 25 },
  empresaNome: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  phoneText: { color: '#fff', fontSize: 16, marginLeft: 8 },
  content: { padding: 20 },
  agendaBtn: { flexDirection: 'row', backgroundColor: '#FFB800', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  agendaBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  listaAgendaContainer: { marginTop: 15 },
  agendaCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 12, marginBottom: 8 },
  agendaInfo: { flexDirection: 'row', alignItems: 'center' },
  diaBadge: { backgroundColor: '#67C5C0', padding: 5, borderRadius: 5, marginRight: 10 },
  diaBadgeText: { color: '#fff', fontWeight: 'bold' },
  horarioText: { fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  infoText: { color: '#666' },
  servicosContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  servicoTag: { backgroundColor: '#E8F5F5', padding: 8, borderRadius: 15, marginRight: 8, marginBottom: 8 },
  servicoTexto: { color: '#008080', fontWeight: 'bold' },
  description: { color: '#666', lineHeight: 20 },
  portfolioContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  portfolioImg: { width: 100, height: 100, borderRadius: 10, marginRight: 10, marginBottom: 10 },
  addBtnSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5F5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  addBtnTextSmall: { color: '#008080', fontWeight: 'bold', fontSize: 14 }
});