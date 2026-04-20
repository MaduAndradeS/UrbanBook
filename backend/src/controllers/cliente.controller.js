const clienteService = require('../services/cliente.service');
const {
  limparNumeros,
  validarCPF,
  validarCEP,
  validarTelefone
} = require('../utils/validacoes');

const removerSenha = (cliente) => {
  if (!cliente) return cliente;
  const { SENHA_HASH, ...clienteSemSenha } = cliente;
  return clienteSemSenha;
};

exports.listarClientes = async (req, res) => {
  try {
    const { busca } = req.query; 
    const clientes = await clienteService.listarClientes(busca);
    return res.status(200).json(clientes.map(removerSenha));
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar clientes', error: error.message });
  }
};

exports.buscarClientePorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const cliente = await clienteService.buscarClientePorId(id);

    if (!cliente) {
      return res.status(404).json({
        message: 'Cliente não encontrado'
      });
    }

    return res.status(200).json(removerSenha(cliente));
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar cliente', error: error.message });
  }
};

exports.criarCliente = async (req, res) => {
  try {
    const { 
      nome, cpf, data_nasc, email, senha, 
      rua, bairro, cidade, estado, cep, telefone 
    } = req.body;

    // 1. Validação de campos vazios
    if (!nome || !cpf || !data_nasc || !email || !senha || !rua || !bairro || !cidade || !estado || !cep || !telefone) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // 2. Validações técnicas
    if (!validarCPF(cpf)) return res.status(400).json({ message: 'CPF inválido' });
    if (!validarCEP(cep)) return res.status(400).json({ message: 'CEP inválido' });
    if (!validarTelefone(telefone)) return res.status(400).json({ message: 'Telefone inválido' });

    // 3. Tratamento de dados
    const bodyTratado = {
      ...req.body,
      cpf: limparNumeros(cpf),
      cep: limparNumeros(cep),
      telefone: limparNumeros(telefone)
    };

    const novoCliente = await clienteService.criarCliente(bodyTratado);
    return res.status(201).json(removerSenha(novoCliente));

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'CPF ou email já cadastrado' });
    }
    return res.status(500).json({ 
      message: 'Erro ao criar cliente', 
      error: error.message 
    });
  }
};