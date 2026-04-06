import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import logo from '../../assets/images/logo.png';

export default function Perfil() {
  return (
    <View style={styles.container}>


      <ScrollView>

        {/* HEADER */}
        <View style={styles.headerContainer}>
  
        <Text style={styles.header}>Urban Book</Text>

        <Image 
            source={logo} 
            style={styles.topIcon}
        />

</View>

        <View style={styles.profile}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>João Victor Minelli</Text>
        </View>

        <Text style={styles.section}>Avaliações</Text>

        <View style={styles.review}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.reviewImg}
          />
          <View>
            <Text style={styles.reviewTitle}>
              João Victor Minelli - Luiz Serviços Gerais
            </Text>
            <Text style={styles.reviewText}>
              Luiz se mostrou excelente e com preços acessíveis.
            </Text>
            <Text>★★★★★</Text>
          </View>
        </View>

        <View style={styles.review}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.reviewImg}
          />
          <View>
            <Text style={styles.reviewTitle}>
              João Victor Minelli - Barbearia Arquimedes
            </Text>
            <Text style={styles.reviewText}>
              Atendimento muito bom, porém muito calor.
            </Text>
            <Text>★★★★☆</Text>
          </View>
        </View>

        <Text style={styles.section}>Próximos agendamentos</Text>

        <View style={styles.agenda}>
          <Image 
            source={{ uri: 'https://picsum.photos/100' }}
            style={styles.agendaImg}
          />
          <View>
            <Text style={styles.agendaTitle}>Espaço Julia Martins</Text>
            <Text>26/03 - 14:40</Text>
          </View>
        </View>

        <Text style={styles.section}>Endereço 1</Text>
        <View style={styles.inputBox}>
          <Text>Rua Senhor Garibaldei, nº 365 - Centro - Campinas</Text>
          <Text style={styles.edit}>Editar</Text>
        </View>

        <Text style={styles.section}>Endereço 2</Text>
        <View style={styles.inputBox}>
          <Text>Rua Marina Kabuto, nº 28 - Piracicaba</Text>
          <Text style={styles.edit}>Editar</Text>
        </View>

      </ScrollView>

    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  profile: {
    alignItems: 'center',
    marginVertical: 20
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40
  },

  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10
  },

  section: {
    marginLeft: 20,
    marginTop: 20,
    fontWeight: 'bold'
  },

  review: {
    flexDirection: 'row',
    margin: 15
  },

  reviewImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },

  reviewTitle: {
    fontWeight: 'bold',
    fontSize: 12
  },

  reviewText: {
    fontSize: 12
  },

  agenda: {
    flexDirection: 'row',
    margin: 15
  },

  agendaImg: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10
  },

  agendaTitle: {
    fontWeight: 'bold'
  },

  inputBox: {
    backgroundColor: '#f2f2f2',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 10,
    marginTop: 5
  },

  edit: {
    position: 'absolute',
    right: 10,
    top: -17,
    color: 'gray'
  },

  navbar: {
    height: 60,
    backgroundColor: '#67C5C0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  headerContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 50,
  marginHorizontal: 20
},

header: {
  fontSize: 26,
  fontWeight: 'bold',
  color: 'gray',
},

topIcon: {
  width: 50,
  height: 50,
  resizeMode: 'contain',
  backgroundColor: 'transparent'
}
});