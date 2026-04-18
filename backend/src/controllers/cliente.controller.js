const clienteService = require('../services/cliente.service');

exports.listarClientes = async (req, res) => {
  try {
    const clientes = await clienteService.listarClientes();

    return res.status(200).json(clientes);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao listar clientes',
      error: error.message,
    });
  }
};