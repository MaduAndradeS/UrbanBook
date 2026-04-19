import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type CardItem = {
  id: string;
  nome: string;
  rota: Href;
  categorias: string[];
  endereco: string;
  imgPerfil: any;
  imgCapa: any;
};

const dados: CardItem[] = [
  {
    id: '1',
    nome: 'Luiz Serviços Gerais',
    rota: '/perfil-empresa-cliente',
    categorias: ['Encanador', 'Eletricista', 'Marceneiro'],
    endereco: 'Rua Moacir Cavallo, 510 - Centro, Campinas SP',
    imgPerfil: require('../../assets/images/eletricista1.png'),
    imgCapa: require('../../assets/images/eletricista2.png')
  },
  {
    id: '2',
    nome: 'Espaço Julia Martins',
    rota: '/perfil-empresa-cliente',
    categorias: ['Cabeleireira', 'Manicure', 'Depilação', 'Design'],
    endereco: 'Rua Sacramento, 935 - Centro, Campinas SP',
    imgPerfil: require('../../assets/images/cabeleireiro1.png'),
    imgCapa: require('../../assets/images/cabeleireiro2.png')
  },
  {
    id: '3',
    nome: 'Barbearia Arquimedes',
    rota: '/perfil-empresa-cliente',
    categorias: ['Barbeiro', 'Cabeleireiro'],
    endereco: 'Rua Fernando Garna, 29 - Taquaral, Campinas SP',
    imgPerfil: require('../../assets/images/barbeiro1.png'),
    imgCapa: require('../../assets/images/barbeiro2.png')
  },
  {
    id: '4',
    nome: 'Rosana Faxinas',
    rota: '/perfil-empresa-cliente',
    categorias: ['Faxina', 'Mudança', 'Pós-Obra'],
    endereco: 'Avenida Jânio Quadros, 328 - Barão Geraldo, Campinas SP',
    imgPerfil: require('../../assets/images/limpeza1.png'),
    imgCapa: require('../../assets/images/limpeza2.png')
  },
  {
    id: '5',
    nome: 'Espaço Podologia EC',
    rota: '/perfil-empresa-cliente',
    categorias: ['Podologia', 'Reflexologia', 'Spa dos Pés'],
    endereco: 'R. Mal. Deodoro da Fonseca, 1350 - Vila Nova, Campinas SP',
    imgPerfil: require('../../assets/images/podologia1.png'),
    imgCapa: require('../../assets/images/podologia2.png')
  }
];

export default function HomeCliente() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.localizacaoContainer}>
          <View style={styles.localizacao}>
            <Ionicons name="location-outline" size={22} color="#000" />
            <Text style={styles.textLocalizacao}>Localização atual</Text>
          </View>
        </View>

        <View style={styles.lista}>
          {dados.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              /* AQUI CONFIGURA A ROTA, nao entendi se a pagina do pedro tem q ser dinamica com o banco de dados, acho q sim*/
              onPress={() => router.push(item.rota)}
            >
              <View style={styles.cardTop}>
                <Image source={item.imgPerfil} style={styles.imgPerfil} />

                <View style={styles.info}>
                  <Text style={styles.nome}>{item.nome}</Text>

                  <View style={styles.estrelas}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons key={i} name="star" size={14} color="#000" />
                    ))}
                  </View>

                  <View style={styles.tags}>
                    {item.categorias.map((cat, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{cat}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <Image source={item.imgCapa} style={styles.imgCapa} />
              </View>

              <Text style={styles.endereco}>{item.endereco}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },

  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 10
  },

  top: {
     flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
  },

  localizacaoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 10
  },

  localizacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  textLocalizacao: {
    marginLeft: 5,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },

  lista: {
    paddingHorizontal: 10
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },

  imgPerfil: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10
  },

  info: {
    flex: 1
  },

  nome: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginBottom: 2
  },

  estrelas: {
    flexDirection: 'row',
    marginBottom: 5
  },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },

  tag: {
    backgroundColor: '#59D6F2',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 5,
    marginBottom: 5
  },

  tagText: {
    fontSize: 11,
    fontWeight:'500',
    color: '#fff'
  },

  imgCapa: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginLeft: 8
  },

  endereco: {
    marginTop: 8,
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center'
  }
});