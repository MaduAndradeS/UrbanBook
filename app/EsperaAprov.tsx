import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';
import logo from '../assets/images/logo.png';

const { height: screenHeight } = Dimensions.get('window');

export default function App() {

  return (
    <>
        <View style={styles.container}>
      
        <View style={styles.top}>
          <Image
            source={logo}
            style={{ marginTop: 0,
    width: 180,
    height: 180, marginBottom: 10 }}
          />
          
        </View>

        <View style={styles.bottom}>

          <Text style={styles.titletext}>
            Tudo pronto
          </Text>
          
          <Text style={styles.text}>
            Aguarde enquanto aprovamos seu cadastro!
          </Text>

          <Text style={styles.textprazo}>
            O prazo de aprovação é de aproximadamente 5 dias.
          </Text>

        </View>

        <Text style={styles.title}>
          Urban Book
        </Text>

        <Text style={styles.graytext}>
          Encontre profissionais perto de você
        </Text>

        </View>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },


  top: {
    height: screenHeight / 3,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    color: 'gray',
  },

  bottom: {
    alignItems: 'center',
    backgroundColor: '#67C5C0',
    padding: 25,
    borderTopLeftRadius: 50,
    borderBottomRightRadius: 50,
    marginTop: -20,
  },
  text: {
    textAlign: 'center',
    marginTop: 50,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 50,
    fontSize: 25,
  },
  textprazo: {
    textAlign: 'center',
    fontSize: 25,
    marginBottom: 50,
  },
  titletext: {
    marginTop: 30,
    fontSize: 30,
    fontWeight: 'bold',
  },
  graytext: {
    textAlign: 'center',
    fontSize: 22,
    marginTop: 10,
    color: 'gray',
  }
});