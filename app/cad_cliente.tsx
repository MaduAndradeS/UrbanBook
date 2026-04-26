import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
  const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [complemento, setComplemento] = useState('');
  const [telefone, setTelefone] = useState('');

  function formatarDataTela(data: Date | null) {
    if (!data) return 'Selecionar data';
    return data.toLocaleDateString('pt-BR');
  }

  function formatarDataBackend(data: Date) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  function calcularIdade(data: Date) {
    const hoje = new Date();

    let idade = hoje.getFullYear() - data.getFullYear();
    const mes = hoje.getMonth() - data.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
      idade--;
    }

    return idade;
  }

  async function buscarCep(cepDigitado: string) {
    const cepLimpo = cepDigitado.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert('Atenção', 'CEP não encontrado.');
        return;
      }

      setRua(data.logradouro || '');
      setBairro(data.bairro || '');
      setCidade(data.localidade || '');
      setUf(data.uf || '');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o CEP.');
    }
  }

  async function validarCadastro() {
    if (
      !nome.trim() ||
      !cpf.trim() ||
      !email.trim() ||
      !senha.trim() ||
      !dataNascimento ||
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

    if (calcularIdade(dataNascimento) < 18) {
      Alert.alert('Atenção', 'É necessário ter pelo menos 18 anos para se cadastrar.');
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
          data_nasc: formatarDataBackend(dataNascimento),
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
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={80}
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
          <TextInput style={styles.input} value={nome} onChangeText={setNome} />

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

          {Platform.OS === 'ios' ? (
            <View style={styles.inputDateIos}>
              <DateTimePicker
                value={dataNascimento || new Date(2000, 0, 1)}
                mode="date"
                display="compact"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setDataNascimento(selectedDate);
                  }
                }}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setMostrarPicker(true)}
              >
                <Text style={dataNascimento ? styles.dataTexto : styles.placeholderData}>
                  {formatarDataTela(dataNascimento)}
                </Text>
              </TouchableOpacity>

              {mostrarPicker && (
                <DateTimePicker
                  value={dataNascimento || new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setMostrarPicker(false);

                    if (selectedDate) {
                      setDataNascimento(selectedDate);
                    }
                  }}
                />
              )}
            </>
          )}

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
                onChangeText={(texto) => {
                  setCep(texto);
                  buscarCep(texto);
                }}
                keyboardType="numeric"
                maxLength={9}
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
          <TextInput style={styles.input} value={rua} onChangeText={setRua} />

          <Text style={styles.label}>Bairro</Text>
          <TextInput style={styles.input} value={bairro} onChangeText={setBairro} />

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
            returnKeyType="done"
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
      </KeyboardAwareScrollView>

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

  inputDateIos: {
    backgroundColor: '#eaeaea',
    borderRadius: 10,
    padding: 8,
    alignItems: 'flex-start',
  },

  dataTexto: {
    color: '#000',
  },

  placeholderData: {
    color: '#888',
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