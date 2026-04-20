import { useRouter } from 'expo-router';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── MOCK DATA ────────────────────────────────────────────────
const MOCK_EMPRESA = {
  nome: 'Luiz Serviços Gerais',
  telefone1: '(19) 96345 - 5167',
  telefone2: '(19) 92738 - 5167',
  endereco: 'Rua Moacir Cavallo, 510 · Centro, Campinas SP',
  estrelas: 5,
  descricao: 'Presto serviços gerais a domicílio.',
  tags: ['Encanador', 'Eletricista', 'Marceneiro'],
  logo: 'https://www.unisuam.edu.br/wp-content/uploads/2023/05/Design-sem-nome-2.png',
  fotos: [
    'https://www.minutoseguros.com.br/blog/wp-content/uploads/2022/07/instalacao-eletrica-em-predio-1.jpg',
  ],
  avaliacoes: [
    {
      id: '1',
      usuario: 'João Victor Minelli',
      foto: 'https://img.freepik.com/free-photo/smiling-young-male-professional-standing-with-arms-crossed-while-making-eye-contact-against-isolated-background_662251-838.jpg?semt=ais_hybrid&w=740&q=80',
      texto: 'Luiz se mostrou excelente e com preços acessíveis.',
      estrelas: 5,
    },
  ],
};

function Stars({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: size, color: i <= count ? '#FFB800' : '#ddd' }}>
          ★
        </Text>
      ))}
    </View>
  );
}

export default function PerfilEmpresaScreen() {
  const empresa = MOCK_EMPRESA;
  const router = useRouter();

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={{ height: 20 }} />

        <View style={s.mainInfo}>
          <Image source={{ uri: empresa.logo }} style={s.logoImg} resizeMode="cover" />
          <View style={s.mainInfoText}>
            <Text style={s.empresaNome}>{empresa.nome}</Text>
            <Text style={s.telefone}>
              {empresa.telefone1}    {empresa.telefone2}
            </Text>
            <Text style={s.endereco}>{empresa.endereco}</Text>
            <Stars count={empresa.estrelas} />
          </View>
        </View>

        <Text style={s.label}>Descrição</Text>
        <View style={s.box}>
          <Text style={s.boxText}>{empresa.descricao}</Text>
        </View>

        <Text style={s.label}>Tags</Text>
        <View style={s.tagsBox}>
          <View style={s.tagsRow}>
            {empresa.tags.map(tag => (
              <View key={tag} style={s.tag}>
                <Text style={s.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={s.label}>Fotos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.fotosScroll}>
          {empresa.fotos.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={s.foto} resizeMode="cover" />
          ))}
        </ScrollView>

        <Text style={s.label}>Avaliações</Text>
        {empresa.avaliacoes.map(av => (
          <View key={av.id} style={s.avaliacaoCard}>
            <Image source={{ uri: av.foto }} style={s.avaliacaoAvatar} />
            <View style={s.avaliacaoInfo}>
              <Text style={s.avaliacaoNome}>{av.usuario}</Text>
              <Text style={s.avaliacaoTexto}>{av.texto}</Text>
              <Stars count={av.estrelas} size={14} />
            </View>
          </View>
        ))}

        <View style={s.btnContainer}>
          <TouchableOpacity
            style={s.agendarBtn}
            onPress={() => router.push('/Cliente_Datas')}
          >
            <Text style={s.agendarText}>Agendar serviço</Text>
          </TouchableOpacity>
        </View>

        {/* Espaço final para respiro da rolagem */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1, paddingHorizontal: 20 },

  mainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 20,
  },
  logoImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  mainInfoText: { flex: 1, gap: 3 },
  empresaNome: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  telefone: { fontSize: 11, color: '#555' },
  endereco: { fontSize: 11, color: '#555', marginBottom: 4 },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
    marginTop: 4,
  },

  box: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  boxText: { fontSize: 13, color: '#333' },

  tagsBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#67C5C0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  fotosScroll: { marginBottom: 16 },
  foto: {
    width: 260,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#eee',
  },

  avaliacaoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  avaliacaoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
  },
  avaliacaoInfo: { flex: 1, gap: 2 },
  avaliacaoNome: { fontSize: 14, fontWeight: '700', color: '#111' },
  avaliacaoTexto: { fontSize: 12, color: '#555' },

  btnContainer: {
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  agendarBtn: {
    backgroundColor: '#67C5C0',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  agendarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});