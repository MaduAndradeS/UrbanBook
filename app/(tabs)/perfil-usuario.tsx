import { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView, StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── MOCK DATA ────────────────────────────────────────────────
const FOTO_JOAO = 'https://img.freepik.com/free-photo/smiling-young-male-professional-standing-with-arms-crossed-while-making-eye-contact-against-isolated-background_662251-838.jpg?semt=ais_hybrid&w=740&q=80';
const FOTO_ESPACO = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFji2RDkdvwH6SRCs79PA26mg33owBDtZePw&s';

const MOCK_USUARIO = {
  nome: 'João Victor Minelli',
  foto: FOTO_JOAO,
  avaliacoes: [
    {
      id: '1',
      fotoAvaliador: FOTO_JOAO,
      empresa: 'Luiz Serviços Gerais',
      texto: 'Luiz se mostrou excelente e com preços acessíveis.',
      estrelas: 5,
    },
    {
      id: '2',
      fotoAvaliador: FOTO_JOAO,
      empresa: 'Barbearia Arquimedes',
      texto: 'Barbearia Arquimedes é muito boa, porém muito calor.',
      estrelas: 3,
    },
  ],
  proximosAgendamentos: [
    {
      id: '1',
      empresa: 'Espaço Julia Martins',
      foto: FOTO_ESPACO,
      data: '26/03 - 14:40',
    },
  ],
  enderecos: [
    { id: '1', label: 'Endereço 1', valor: 'Rua Senhor Gariballdei, nº 365 - Centro - Campinas' },
    { id: '2', label: 'Endereço 2', valor: 'Rua Marina Kabuto, nº 28 - Piracicaba' },
  ],
};

function Stars({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: size, color: i <= count ? '#FFB800' : '#ddd' }}>★</Text>
      ))}
    </View>
  );
}

export default function PerfilUsuarioScreen() {
  const usuario = MOCK_USUARIO;
  const [enderecos, setEnderecos] = useState(usuario.enderecos);
  const [editando, setEditando]   = useState<string | null>(null);

  const handleEnderecoChange = (id: string, valor: string) => {
    setEnderecos(prev => prev.map(e => e.id === id ? { ...e, valor } : e));
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.topHeader}>
          <Text style={s.brandName}>Urban Book</Text>
          <View style={s.iconBtn}><Text style={s.iconBtnText}>📋</Text></View>
        </View>

        {/* Avatar + Nome */}
        <View style={s.profileHeader}>
          <Image source={{ uri: usuario.foto }} style={s.avatarGrande} />
          <Text style={s.userName}>{usuario.nome}</Text>
        </View>

        {/* Avaliações */}
        <Text style={s.sectionTitle}>Avaliações</Text>
        {usuario.avaliacoes.map(av => (
          <View key={av.id} style={s.avaliacaoCard}>
            <Image source={{ uri: av.fotoAvaliador }} style={s.avatarSmall} />
            <View style={s.avaliacaoInfo}>
              <Text style={s.avaliacaoTitulo}>{usuario.nome} - {av.empresa}</Text>
              <Text style={s.avaliacaoTexto}>{av.texto}</Text>
              <Stars count={av.estrelas} />
            </View>
          </View>
        ))}

        {/* Próximos agendamentos */}
        <Text style={s.sectionTitle}>Próximos agendamentos</Text>
        {usuario.proximosAgendamentos.map(ag => (
          <View key={ag.id} style={s.agendamentoCard}>
            <Image source={{ uri: ag.foto }} style={s.agendamentoFoto} />
            <View>
              <Text style={s.agendamentoEmpresa}>{ag.empresa}</Text>
              <Text style={s.agendamentoData}>{ag.data}</Text>
            </View>
          </View>
        ))}

        {/* Endereços */}
        {enderecos.map(end => (
          <View key={end.id} style={{ marginBottom: 16 }}>
            <View style={s.enderecoHeader}>
              <Text style={s.sectionTitle}>{end.label}</Text>
              <TouchableOpacity onPress={() => setEditando(editando === end.id ? null : end.id)}>
                <Text style={s.editarText}>Editar</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[s.enderecoInput, editando === end.id && s.enderecoInputAtivo]}
              value={end.valor}
              onChangeText={val => handleEnderecoChange(end.id, val)}
              editable={editando === end.id}
              multiline
            />
          </View>
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
    alignItems: 'center', marginTop: 16, marginBottom: 20,
  },
  brandName: { fontSize: 20, color: '#999', fontWeight: '400' },
  iconBtn: {
    width: 36, height: 36, borderRadius: 8,
    borderWidth: 1, borderColor: '#ddd',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18 },

  profileHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 16, marginBottom: 28,
  },
  avatarGrande: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#eee',
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#111', flex: 1, flexWrap: 'wrap' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 10 },

  avaliacaoCard: {
    flexDirection: 'row', gap: 10,
    alignItems: 'flex-start', marginBottom: 14,
  },
  avatarSmall: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#eee',
  },
  avaliacaoInfo:   { flex: 1, gap: 2 },
  avaliacaoTitulo: { fontSize: 13, fontWeight: '700', color: '#111' },
  avaliacaoTexto:  { fontSize: 12, color: '#555' },

  agendamentoCard: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 20,
  },
  agendamentoFoto: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: '#eee',
  },
  agendamentoEmpresa: { fontSize: 14, fontWeight: '700', color: '#111' },
  agendamentoData:    { fontSize: 12, color: '#777' },

  enderecoHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  editarText: { fontSize: 13, color: '#67C5C0', fontWeight: '600' },
  enderecoInput: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 12, fontSize: 13, color: '#333', backgroundColor: '#fafafa',
  },
  enderecoInputAtivo: {
    borderColor: '#67C5C0', backgroundColor: '#fff',
  },});