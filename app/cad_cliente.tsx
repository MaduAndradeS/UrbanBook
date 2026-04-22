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

const API_BASE_URL = 'http://192.168.0.101:3333/api';

export default function CadCliente() {
  const router = useRouter();
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('Cliente');
  const [carregando, setCarregando] = useState(false);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [complemento, setComplemento] = useState('');
  const [telefone, setTelefone] = useState('');

  async function validarCadastro() {
    if (
      !nome.trim() ||
      !cpf.trim() ||
      !email.trim() ||
      !senha.trim() ||
      !dataNascimento.trim() ||
      !cep.trim() ||
      !numero.trim() ||
      !rua.trim() ||
      !bairro.trim() ||
      !cidade.trim() ||
      !uf.trim() ||
      !telefone.trim()
    ) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setCarregando(true);

      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nome.trim(),
          cpf: cpf.trim(),
          data_nasc: dataNascimento.trim(),
          email: email.trim(),
          senha: senha.trim(),
          rua: rua.trim(),
          num: Number(numero),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          estado: uf.trim().toUpperCase(),
          cep: cep.trim(),
          comp: complemento.trim(),
          telefone: telefone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.message || 'Não foi possível cadastrar.');
        return;
      }

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.replace('/'),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível conectar ao servidor. Verifique se o backend está rodando e se o IP está correto.'
      );
    } finally {
      setCarregando(false);
    }
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
          <Text style={styles.subtitle}>Cadastro de cliente</Text>
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

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={setCpf}
            keyboardType="numeric"
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

          <Text style={styles.label}>Data de nascimento</Text>
          <TextInput
            style={styles.input}
            value={dataNascimento}
            onChangeText={setDataNascimento}
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />

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
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <Text style={styles.label}>Complemento</Text>
          <TextInput
            style={styles.input}
            value={complemento}
            onChangeText={setComplemento}
          />

          <TouchableOpacity
            style={[styles.loginButton, carregando && styles.loginButtonDisabled]}
            onPress={validarCadastro}
            disabled={carregando}
          >
            <Text style={styles.loginText}>
              {carregando ? 'Cadastrando...' : 'Cadastrar'}
            </Text>
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

                        if (item === 'Prestador') {
                          router.replace('/cad_emp');
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
    fontSize: 16,
    color: '#000',
  },

  selectArrow: {
    fontSize: 12,
    color: '#000',
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

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginText: {
    color: '#fff',
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
});