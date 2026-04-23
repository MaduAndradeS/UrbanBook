const clienteService = require('../services/cliente.service');
<<<<<<< Updated upstream
=======
const bcrypt = require('bcrypt');
const {
  limparNumeros,
  validarCPF,
  validarCEP,
  validarTelefone
} = require('../utils/validacoes');
>>>>>>> Stashed changes

const removerSenha = (cliente) => {
  if (!cliente) return cliente;

  const { SENHA_HASH, ...clienteSemSenha } = cliente;
  return clienteSemSenha;
};

exports.listarClientes = async (req, res) => {
  try {
    const clientes = await clienteService.listarClientes();

    const clientesSemSenha = clientes.map(removerSenha);

    return res.status(200).json(clientesSemSenha);
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
      rua,
      bairro,
      cidade,
      estado,
      cep,
      telefone
    } = req.body;

    if (
      !nome ||
      !cpf ||
      !data_nasc ||
      !email ||
      !senha ||
      !rua ||
      !bairro ||
      !cidade ||
      !estado ||
      !cep ||
      !telefone
    ) {
      return res.status(400).json({
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    const novoCliente = await clienteService.criarCliente(req.body);

    return res.status(201).json(removerSenha(novoCliente));
  } catch (error) {
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