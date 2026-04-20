const admService = require('../services/adm.service');

exports.criarAdmTeste = async (req, res) => {
  try {
    const adm = await admService.criarAdmTeste();

    return res.status(201).json({
      message: 'ADM de teste criado com sucesso',
      adm
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao criar ADM de teste',
      error: error.message
    });
  }
};

exports.listarAdms = async (req, res) => {
  try {
    const adms = await admService.listarAdms();

    return res.status(200).json(adms);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao listar ADMs',
      error: error.message
    });
  }
};