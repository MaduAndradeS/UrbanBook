import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Configurações de Conexão
const API_URL = 'http://192.168.0.225:3333/api';
const ID_EMPRESARIO_ATUAL = 5; 

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
const HORARIOS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
];

export default function PerfilEmpresa() {
  const [perfilImg, setPerfilImg] = useState('https://via.placeholder.com/150');
  const [nomeEmpresario, setNomeEmpresario] = useState('Carregando...');
  const [bio, setBio] = useState('Buscando informações...');
  const [telefone, setTelefone] = useState('Não informado');
  const [endereco, setEndereco] = useState('Endereço não cadastrado');
  const [servicos, setServicos] = useState<any[]>([]);
  const [fotosTrabalho, setFotosTrabalho] = useState<any[]>([]);
  
  // ESTADOS DA AGENDA
  const [agenda, setAgenda] = useState<any[]>([]);
  const [modalAgendaVisivel, setModalAgendaVisivel] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState('Seg');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [salvandoAgenda, setSalvandoAgenda] = useState(false);

  // 1. CARREGAMENTO INICIAL
  useEffect(() => {
    async function carregarDados() {
      try {
        // Busca Perfil
        const resPerfil = await fetch(`${API_URL}/empresarios/${ID_EMPRESARIO_ATUAL}`);
        const data = await resPerfil.json();
        
        if (resPerfil.ok) {
          if (data.FOTO_PERFIL) setPerfilImg(data.FOTO_PERFIL);
          if (data.NOME) setNomeEmpresario(data.NOME);
          if (data.BIO) setBio(data.BIO);
          if (data.TELEFONE && data.TELEFONE.length > 0) setTelefone(data.TELEFONE[0].TELEFONE);
          if (data.ENDERECO && data.ENDERECO.length > 0) {
            const end = data.ENDERECO[0];
            setEndereco(`${end.RUA}, ${end.NUM} - ${end.BAIRRO}, ${end.CIDADE} - ${end.ESTADO}`);
          }
          if (data.SERVICOS) setServicos(data.SERVICOS);
          if (data.FOTO_TRABALHO) setFotosTrabalho(data.FOTO_TRABALHO);
        }

        // Busca Agenda
        const resAgenda = await fetch(`${API_URL}/empresarios/${ID_EMPRESARIO_ATUAL}/disponibilidade`);
        if (resAgenda.ok) {
          const dataAgenda = await resAgenda.json();
          const lista = Array.isArray(dataAgenda) ? dataAgenda : (dataAgenda.disponibilidade || []);
          setAgenda(lista);
        }
      } catch (error) {
        console.log('Erro na carga inicial:', error);
      } finally {
        setLoadingInicial(false);
      }
    }
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
        console.error(error);
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
        if (response.ok && (data.URL || data.foto)) {
          const novaFoto = data.foto || data;
          setFotosTrabalho(prev => [...prev, novaFoto]);
          Alert.alert('Sucesso', 'Foto adicionada ao portfólio!');
        }
      } catch (error) { 
        console.error(error); 
        Alert.alert('Erro', 'O servidor não respondeu.');
      } finally { 
        setLoading(false); 
      }
    }
  };

  // 4. SALVAR HORÁRIO NA AGENDA
  const handleSalvarHorario = async () => {
    if (!horaInicio || !horaFim) {
      Alert.alert('Aviso', 'Selecione o horário de abertura e o de fechamento!');
      return;
    }

    setSalvandoAgenda(true);
    try {
      const response = await fetch(`${API_URL}/empresarios/disponibilidade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_empresario: ID_EMPRESARIO_ATUAL,
          dia_semana: diaSelecionado,
          hora_inicio: horaInicio,
          hora_fim: horaFim
        })
      });

      if (response.ok) {
        const novaDispo = await response.json();
        setAgenda(prev => [...prev, novaDispo]);
        Alert.alert('Sucesso', `Horário de ${diaSelecionado} salvo com sucesso!`);
        setModalAgendaVisivel(false);
        setHoraInicio('');
        setHoraFim('');
      } else {
        const err = await response.json();
        Alert.alert('Erro', err.message || 'Não foi possível salvar.');
      }
    } catch (error) {
      Alert.alert('Erro de Rede', 'Verifique a conexão com o servidor.');
    } finally {
      setSalvandoAgenda(false);
    }
  };

  // 5. EXCLUIR HORÁRIO DA AGENDA
  const handleExcluirHorario = (idDisp: number) => {
    Alert.alert(
      "Excluir Horário",
      "Deseja realmente apagar este horário de sua agenda?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/empresarios/disponibilidade/${idDisp}`, {
                method: 'DELETE'
              });

              if (response.ok) {
                // Atualiza a lista removendo o item apagado
                setAgenda(prev => prev.filter(item => item.ID_DISP !== idDisp));
              } else {
                Alert.alert("Erro", "Não foi possível apagar do servidor.");
              }
            } catch (e) {
              Alert.alert("Erro de Rede", "A conexão falhou.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={s.container}>
        
        {/* CABEÇALHO DO PERFIL */}
        <View style={s.header}>
          <View style={s.logoContainer}>
            {loadingInicial ? (
               <ActivityIndicator size="large" color="#fff" style={s.logoImg} />
            ) : (
               <Image source={{ uri: perfilImg }} style={s.logoImg} />
            )}

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
          
          {/* CONFIGURAR AGENDA */}
          <TouchableOpacity style={s.agendaBtn} onPress={() => setModalAgendaVisivel(true)}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color="#fff" />
            <Text style={s.agendaBtnText}>Novo Horário de Atendimento</Text>
          </TouchableOpacity>

          {/* LISTA DE HORÁRIOS JÁ CRIADOS */}
          <View style={s.listaAgendaContainer}>
            {agenda.length > 0 ? (
              agenda.map((item, index) => (
                <View key={item.ID_DISP || index} style={s.agendaCard}>
                  <View style={s.agendaInfo}>
                    <View style={s.diaBadge}>
                      <Text style={s.diaBadgeText}>{item.DIAS_ATIVOS}</Text>
                    </View>
                    <Text style={s.horarioText}>{item.PERIODOS}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleExcluirHorario(item.ID_DISP)} style={s.deleteBtn}>
                    <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ff4d4d" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={s.description}>Você ainda não possui horários cadastrados.</Text>
            )}
          </View>

          <View style={s.divider} />

          {/* LOCALIZAÇÃO */}
          <Text style={s.sectionTitle}>Localização</Text>
          <View style={s.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#008080" />
            <Text style={s.infoText}>{endereco}</Text>
          </View>

          <View style={s.divider} />

          {/* SERVIÇOS */}
          <Text style={s.sectionTitle}>Serviços Oferecidos</Text>
          <View style={s.servicosContainer}>
            {servicos.length > 0 ? (
              servicos.map((servico, index) => (
                <View key={index} style={s.servicoTag}>
                  <MaterialCommunityIcons name="tools" size={16} color="#008080" style={{ marginRight: 5 }} />
                  <Text style={s.servicoTexto}>{servico.NOME}</Text>
                </View>
              ))
            ) : (
              <Text style={s.description}>Nenhum serviço cadastrado.</Text>
            )}
          </View>

          <View style={s.divider} />

          {/* BIO */}
          <Text style={s.sectionTitle}>Sobre o seu negócio</Text>
          <Text style={s.description}>{bio || "Nenhuma descrição disponível."}</Text>

          <View style={s.divider} />

          {/* PORTFÓLIO */}
          <View style={s.portfolioHeader}>
            <Text style={s.sectionTitle}>Fotos do Trabalho</Text>
            <TouchableOpacity style={s.addPhotoBtn} onPress={handleAddPortfolioPhoto}>
              <MaterialCommunityIcons name="plus" size={18} color="#008080" />
              <Text style={s.addPhotoText}>Adicionar Foto</Text>
            </TouchableOpacity>
          </View>

          <View style={s.portfolioContainer}>
            {fotosTrabalho.length > 0 ? (
              fotosTrabalho.map((foto, index) => (
                <Image 
                  key={index} 
                  source={{ uri: foto.URL || foto.url }} 
                  style={s.portfolioImg} 
                  resizeMode="cover"
                />
              ))
            ) : (
              <Text style={s.description}>Nenhuma foto adicionada ainda.</Text>
            )}
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* MODAL DE AGENDAMENTO */}
      <Modal visible={modalAgendaVisivel} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Novo Horário</Text>
              <TouchableOpacity onPress={() => setModalAgendaVisivel(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={s.modalLabel}>1. Escolha o Dia da Semana</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.diasContainer}>
              {DIAS_SEMANA.map(dia => (
                <TouchableOpacity 
                  key={dia} 
                  style={[s.diaBubble, diaSelecionado === dia && s.diaBubbleSelected]}
                  onPress={() => setDiaSelecionado(dia)}
                >
                  <Text style={[s.diaTexto, diaSelecionado === dia && s.diaTextoSelected]}>{dia}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.modalLabel}>2. Horário de Abertura</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horariosContainer}>
              {HORARIOS.map(hora => (
                <TouchableOpacity 
                  key={`inicio-${hora}`} 
                  style={[s.horaBubble, horaInicio === hora && s.horaBubbleSelected]}
                  onPress={() => setHoraInicio(hora)}
                >
                  <Text style={[s.horaTexto, horaInicio === hora && s.horaTextoSelected]}>{hora}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.modalLabel}>3. Horário de Fechamento</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horariosContainer}>
              {HORARIOS.map(hora => (
                <TouchableOpacity 
                  key={`fim-${hora}`} 
                  style={[s.horaBubble, horaFim === hora && s.horaBubbleSelected]}
                  onPress={() => setHoraFim(hora)}
                >
                  <Text style={[s.horaTexto, horaFim === hora && s.horaTextoSelected]}>{hora}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={s.salvarBtn} onPress={handleSalvarHorario} disabled={salvandoAgenda}>
              {salvandoAgenda ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.salvarBtnText}>Salvar na Agenda</Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#67C5C0', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  logoContainer: { position: 'relative' },
  logoImg: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#fff', backgroundColor: '#e1e4e8', justifyContent: 'center' },
  editBtn: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#FFB800', padding: 10, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 70, justifyContent: 'center', alignItems: 'center' },
  empresaNome: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, opacity: 0.9 },
  phoneText: { color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: '500' },
  content: { padding: 20 },
  
  // ESTILOS DA AGENDA
  agendaBtn: { flexDirection: 'row', backgroundColor: '#FFB800', paddingVertical: 14, paddingHorizontal: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 5, elevation: 2 },
  agendaBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  listaAgendaContainer: { marginTop: 20 },
  agendaCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  agendaInfo: { flexDirection: 'row', alignItems: 'center' },
  diaBadge: { backgroundColor: '#67C5C0', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, marginRight: 10 },
  diaBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  horarioText: { color: '#444', fontSize: 15, fontWeight: '500' },
  deleteBtn: { padding: 5 },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  infoText: { fontSize: 15, color: '#666', marginLeft: 8, flex: 1, lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  description: { fontSize: 15, color: '#666', lineHeight: 22 },
  servicosContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 },
  servicoTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5F5', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#B2DFDB' },
  servicoTexto: { color: '#008080', fontWeight: 'bold', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 20 },
  portfolioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  addPhotoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: '#B2DFDB' },
  addPhotoText: { color: '#008080', fontWeight: 'bold', fontSize: 14, marginLeft: 4 },
  portfolioContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  portfolioImg: { width: 105, height: 105, borderRadius: 8, marginBottom: 10, marginRight: 10, backgroundColor: '#eee' },

  // ESTILOS DO MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
  diasContainer: { flexDirection: 'row', marginBottom: 10 },
  diaBubble: { backgroundColor: '#f0f0f0', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
  diaBubbleSelected: { backgroundColor: '#67C5C0', borderColor: '#67C5C0' },
  diaTexto: { color: '#666', fontWeight: 'bold' },
  diaTextoSelected: { color: '#fff' },
  horariosContainer: { flexDirection: 'row', marginBottom: 15 },
  horaBubble: { backgroundColor: '#f9f9f9', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: '#ccc' },
  horaBubbleSelected: { backgroundColor: '#FFB800', borderColor: '#FFB800' },
  horaTexto: { color: '#444', fontWeight: 'bold' },
  horaTextoSelected: { color: '#fff' },
  salvarBtn: { backgroundColor: '#67C5C0', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  salvarBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});