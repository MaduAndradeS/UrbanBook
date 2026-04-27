import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [idEmpresario, setIdEmpresario] = useState<number | null>(null);

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


  // 🔹 CARREGAR DADOS
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

  // FOTO
  if (dataP.FOTO_PERFIL) {
    setPerfilImg(dataP.FOTO_PERFIL);
  }

  // TELEFONE
  if (dataP.TELEFONE?.length > 0) {
    setTelefone(dataP.TELEFONE[0].TELEFONE);
  }

  // ENDEREÇO
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

  return () => {
    isMounted = false;
  };
}, []);

  // 🔹 EXCLUIR HORÁRIO
  const handleExcluirHorario = async (idDisp: number) => {
    Alert.alert("Excluir", "Deseja apagar este horário?", [
      { text: "Cancelar" },
      {
        text: "Sim",
        onPress: async () => {
          try {
            const res = await fetch(
              `${API_URL}/empresarios/disponibilidade/${idDisp}`,
              { method: 'DELETE' }
            );

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

            <TouchableOpacity style={styles.editBtn}>
              <MaterialCommunityIcons name="camera-plus" size={22} color="white" />
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
            <Text style={styles.agendaBtnText}>
              Novo Horário de Atendimento
            </Text>
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

          <Text style={styles.sectionTitle}>Portfólio</Text>
          <View style={styles.portfolioContainer}>
            {fotosTrabalho.map((f, i) => (
              <Image key={i} source={{ uri: f.URL }} style={styles.portfolioImg} />
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#67C5C0',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },

  logoContainer: { position: 'relative' },

  logoImg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#fff'
  },

  editBtn: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FFB800',
    padding: 10,
    borderRadius: 25
  },

  empresaNome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },

  phoneText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8
  },

  content: { padding: 20 },

  agendaBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFB800',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },

  agendaBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10
  },

  listaAgendaContainer: { marginTop: 15 },

  agendaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8
  },

  agendaInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  diaBadge: {
    backgroundColor: '#67C5C0',
    padding: 5,
    borderRadius: 5,
    marginRight: 10
  },

  diaBadgeText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  horarioText: { fontWeight: 'bold' },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },

  infoText: { color: '#666' },

  servicosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },

  servicoTag: {
    backgroundColor: '#E8F5F5',
    padding: 8,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8
  },

  servicoTexto: {
    color: '#008080',
    fontWeight: 'bold'
  },

  description: {
    color: '#666',
    lineHeight: 20
  },

  portfolioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },

  portfolioImg: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10
  }
});