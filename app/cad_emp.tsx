import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import logo from '../assets/images/logo.png';

const { height: screenHeight } = Dimensions.get('window');

export default function App() {
  const router = useRouter();

  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('Prestador');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');

  const services = [
    'Encanador',
    'Eletricista',
    'Marceneiro',
    'Pintor',
    'Pedreiro',
    'Jardineiro',
    'Diarista',
    'Chaveiro',
    'Mecânico',
    'Vidraceiro',
  ];

  function toggleService(service: string) {
    const alreadySelected = selectedServices.includes(service);

    if (alreadySelected) {
      setSelectedServices(selectedServices.filter(item => item !== service));
      return;
    }

    if (selectedServices.length < 5) {
      setSelectedServices([...selectedServices, service]);
    }
  }

  function removeService(service: string) {
    setSelectedServices(selectedServices.filter(item => item !== service));
  }

  function validarCadastro() {
    if (
      !nome.trim() ||
      !cnpj.trim() ||
      !email.trim() ||
      !senha.trim() ||
      !cep.trim() ||
      !numero.trim() ||
      !rua.trim() ||
      !bairro.trim() ||
      !cidade.trim() ||
      !uf.trim()
    ) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um serviço.');
      return;
    }

    Alert.alert('Sucesso', 'Cadastro validado com sucesso!');
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.top}>
          <Image
            source={logo}
            style={{ marginTop: 0, marginBottom: 8, width: 125, height: 125 }}
          />

          <Text style={styles.title}>Urban Book</Text>
          <Text style={styles.subtitle}>Cadastro de prestador</Text>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setTypeModalVisible(true)}
          >
            <Text style={styles.selectText}>{selectedType}</Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>CNPJ</Text>
          <TextInput
            style={styles.input}
            value={cnpj}
            onChangeText={setCnpj}
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <Text style={styles.label}>Serviços</Text>
          <TouchableOpacity
            style={styles.inputSelect}
            onPress={() => setServiceModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.inputSelectContent}>
              {selectedServices.length > 0 ? (
                <View style={styles.selectedChipsContainer}>
                  {selectedServices.map((service, index) => (
                    <View key={index} style={styles.selectedChip}>
                      <Text style={styles.selectedChipText}>{service}</Text>

                      <TouchableOpacity
                        onPress={() => removeService(service)}
                        style={styles.removeChipButton}
                      >
                        <Text style={styles.removeChipButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.placeholderText}>Selecione até 5 serviços</Text>
              )}
            </View>

            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Endereço</Text>

          <View style={styles.row}>
            <View style={styles.inputSmallContainer}>
              <Text style={styles.smallLabel}>CEP</Text>
              <TextInput
                style={styles.inputSmall}
                value={cep}
                onChangeText={setCep}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputSmallContainer}>
              <Text style={styles.smallLabel}>Número</Text>
              <TextInput
                style={styles.inputSmall}
                value={numero}
                onChangeText={setNumero}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Rua</Text>
          <TextInput
            style={styles.input}
            value={rua}
            onChangeText={setRua}
          />

          <Text style={styles.label}>Bairro</Text>
          <TextInput
            style={styles.input}
            value={bairro}
            onChangeText={setBairro}
          />

          <View style={styles.row}>
            <View style={styles.inputCityContainer}>
              <Text style={styles.smallLabel}>Cidade</Text>
              <TextInput
                style={styles.inputCity}
                value={cidade}
                onChangeText={setCidade}
              />
            </View>

            <View style={styles.inputUfContainer}>
              <Text style={styles.smallLabel}>UF</Text>
              <TextInput
                style={styles.inputUf}
                value={uf}
                onChangeText={setUf}
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={validarCadastro}
          >
            <Text style={styles.loginText}>Solicitar cadastro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={typeModalVisible}
        animationType="fade"
        onRequestClose={() => setTypeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setTypeModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.typeModalBox}>
                <Text style={styles.modalTitle}>Selecione o tipo</Text>

                {['Prestador', 'Cliente'].map((item, index) => {
                  const isSelected = selectedType === item;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.typeOption,
                        isSelected && styles.typeOptionSelected,
                      ]}
                      onPress={() => {
                        setTypeModalVisible(false);

                        if (item === 'Cliente') {
                          router.replace('/cad_cliente');
                        } else {
                          setSelectedType(item);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          isSelected && styles.typeOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent
        visible={serviceModalVisible}
        animationType="fade"
        onRequestClose={() => setServiceModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setServiceModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Selecione até 5 serviços</Text>

                <View style={styles.chipsContainer}>
                  {services.map((item, index) => {
                    const isSelected = selectedServices.includes(item);

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.chip,
                          isSelected && styles.chipSelected,
                        ]}
                        onPress={() => toggleService(item)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.limitText}>
                  Selecionados: {selectedServices.length}/5
                </Text>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setServiceModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  scrollContainer: {
    minHeight: screenHeight,
  },

  top: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start', 
  paddingTop: 10, 
  paddingBottom: 20,              
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },

  subtitle: {
    textAlign: 'center',
    marginTop: 5,
  },

  bottom: {
    minHeight: (screenHeight / 3) * 2,
    backgroundColor: '#67C5C0',
    padding: 25,
    borderTopLeftRadius: 50,
  },

  selectButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BFE7E4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },

  selectText: {
    marginRight: 5,
  },

  selectArrow: {
    fontSize: 12,
  },

  label: {
    marginTop: 10,
    marginBottom: 5,
    color: '#000',
  },

  smallLabel: {
    marginBottom: 5,
    color: '#000',
  },

  input: {
    backgroundColor: '#eaeaea',
    padding: 12,
    borderRadius: 10,
  },

  inputSelect: {
    backgroundColor: '#eaeaea',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 50,
  },

  inputSelectContent: {
    flex: 1,
    marginRight: 10,
  },

  placeholderText: {
    color: '#666',
    marginTop: 2,
  },

  selectedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  selectedChip: {
    backgroundColor: '#6ecff6',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedChipText: {
    color: '#fff',
    fontSize: 13,
    marginRight: 6,
  },

  removeChipButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  removeChipButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 13,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  inputSmallContainer: {
    width: '48%',
  },

  inputSmall: {
    backgroundColor: '#eaeaea',
    padding: 12,
    borderRadius: 10,
  },

  inputCityContainer: {
    width: '65%',
  },

  inputUfContainer: {
    width: '30%',
  },

  inputCity: {
    backgroundColor: '#eaeaea',
    padding: 12,
    borderRadius: 10,
  },

  inputUf: {
    backgroundColor: '#eaeaea',
    padding: 12,
    borderRadius: 10,
  },

  loginButton: {
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },

  loginText: {
    color: '#fff',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
  },

  typeModalBox: {
    width: '75%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  typeOption: {
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f2f2f2',
  },

  typeOptionSelected: {
    backgroundColor: '#BFE7E4',
  },

  typeOptionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
  },

  typeOptionTextSelected: {
    fontWeight: 'bold',
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  chip: {
    backgroundColor: '#6ecff6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 4,
  },

  chipSelected: {
    backgroundColor: '#2ea7db',
  },

  chipText: {
    color: '#fff',
    fontSize: 14,
  },

  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  limitText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#333',
  },

  modalCloseButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },

  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});