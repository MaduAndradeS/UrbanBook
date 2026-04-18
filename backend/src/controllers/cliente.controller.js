const clienteService = require('../services/cliente.service');

exports.listarClientes = async (req, res) => {
  try {
    const clientes = await clienteService.listarClientes();

    return res.status(200).json(clientes);
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

    return res.status(200).json(cliente);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar cliente',
      error: error.message
    });
  }
};

exports.criarCliente = async (req, res) => {
  try {
    const { nome, cpf, data_nasc, email, senha } = req.body;

    if (!nome || !cpf || !data_nasc || !email || !senha) {
      return res.status(400).json({
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    const novoCliente = await clienteService.criarCliente(req.body);

    return res.status(201).json(novoCliente);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao criar cliente',
      error: error.message
    });
  }
};