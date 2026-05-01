const clienteService = require('../services/cliente.service');
const cloudinary = require('cloudinary').v2;

const {
  buscarEnderecoPorCep,
  buscarLatitudeLongitude
} = require('../utils/localizacao.utils');

const {
  limparNumeros,
  validarCPF,
  validarEmail,
  validarCEP,
  validarTelefone
} = require('../utils/validacoes');

const removerSenha = (cliente) => {
  if (!cliente) return cliente;
  const { SENHA_HASH, ...clienteSemSenha } = cliente;
  return clienteSemSenha;
};

const apagarImagemCloudinary = async (req) => {
  if (req.file && req.file.filename) {
    try {
      await cloudinary.uploader.destroy(req.file.filename);
      console.log('Imagem deletada do Cloudinary');
    } catch (e) {
      console.error('Erro ao deletar imagem:', e);
    }
  }
};

function calcularIdade(dataNascimento) {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade;
}

exports.listarClientes = async (req, res) => {
  try {
    const { busca } = req.query;
    const clientes = await clienteService.listarClientes(busca);

    return res.status(200).json(clientes.map(removerSenha));
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao listar clientes',
      error: error.message
    });
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
    return res.status(500).json({
      message: 'Erro ao buscar cliente',
      error: error.message
    });
  }
};

exports.criarCliente = async (req, res) => {
  try {
    const {
      nome,
      cpf,
      data_nasc,
      email,
      senha,
      cep,
      telefone
    } = req.body;

    if (
      !nome ||
      !cpf ||
      !data_nasc ||
      !email ||
      !senha ||
      !cep ||
      !telefone
    ) {
      await apagarImagemCloudinary(req);
      return res.status(400).json({
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    if (calcularIdade(data_nasc) < 18) {
      await apagarImagemCloudinary(req);
      return res.status(400).json({
        message: 'É necessário ter pelo menos 18 anos para se cadastrar.'
      });
    }

    if (!validarCPF(cpf)) {
      await apagarImagemCloudinary(req);
      return res.status(400).json({
        message: 'CPF inválido'
      });
    }

    if (!validarEmail(email)) {
      await apagarImagemCloudinary(req);
      return res.status(400).json({
        message: 'Email inválido'
      });
    }

    if (!validarCEP(cep)) {
      await apagarImagemCloudinary(req);
      return res.status(400).json({
        message: 'CEP inválido'
      });
    }

    if (!validarTelefone(telefone)) {
      await apagarImagemCloudinary(req);
      return res.status(400).json({
        message: 'Telefone inválido'
      });
    }

    const cepLimpo = limparNumeros(cep);

    const enderecoCep = await buscarEnderecoPorCep(cepLimpo);
    const coordenadas = await buscarLatitudeLongitude(enderecoCep);

    const fotoUrl = req.file ? req.file.path : null;

    const bodyTratado = {
      ...req.body,
      cpf: limparNumeros(cpf),
      cep: enderecoCep.cep,
      telefone: limparNumeros(telefone),

      rua: enderecoCep.rua,
      bairro: enderecoCep.bairro,
      cidade: enderecoCep.cidade,
      estado: enderecoCep.estado,

      latitude: coordenadas?.latitude || null,
      longitude: coordenadas?.longitude || null,

      foto_perfil: fotoUrl
    };

    const novoCliente = await clienteService.criarCliente(bodyTratado);

    return res.status(201).json(removerSenha(novoCliente));
  } catch (error) {
    await apagarImagemCloudinary(req);

    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'CPF ou email já cadastrado'
      });
    }

    return res.status(500).json({
      message: 'Erro ao criar cliente',
      error: error.message
    });
  }
};

// NOVA FUNÇÃO CORRIGIDA (AGORA ESTÁ NO LUGAR CERTO)
exports.atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone } = req.body; 

    const cliente = await clienteService.atualizarCliente(id, { nome, telefone });
    return res.json(removerSenha(cliente));
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao atualizar cliente' });
  }
};