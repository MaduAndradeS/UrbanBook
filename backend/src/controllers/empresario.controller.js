const empresarioService = require('../services/empresario.service');
const {
  limparNumeros,
  validarCNPJ,
  validarCEP,
  validarTelefone
} = require('../utils/validacoes');

const removerSenha = (empresario) => {
  if (!empresario) return empresario;

  const { SENHA_HASH, ...empresarioSemSenha } = empresario;
  return empresarioSemSenha;
};

exports.listarEmpresarios = async (req, res) => {
  try {
    const empresarios = await empresarioService.listarEmpresarios();
    return res.status(200).json(empresarios.map(removerSenha));
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao listar empresários',
      error: error.message
    });
  }
};

exports.listarEmpresariosPendentes = async (req, res) => {
  try {
    const empresarios = await empresarioService.listarEmpresariosPendentes();
    return res.status(200).json(empresarios.map(removerSenha));
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao listar empresários pendentes',
      error: error.message
    });
  }
};

exports.buscarEmpresarioPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const empresario = await empresarioService.buscarEmpresarioPorId(id);

    if (!empresario) {
      return res.status(404).json({
        message: 'Empresário não encontrado'
      });
    }

    return res.status(200).json(removerSenha(empresario));
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar empresário',
      error: error.message
    });
  }
};

exports.criarEmpresario = async (req, res) => {
  try {
    const {
      nome,
      cnpj,
      email,
      senha,
      rua,
      bairro,
      cidade,
      estado,
      cep,
      telefone,
      servicos
    } = req.body;

    if (
      !nome ||
      !cnpj ||
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

    if (!Array.isArray(servicos) || servicos.length === 0) {
      return res.status(400).json({
        message: 'Selecione pelo menos um serviço'
      });
    }

    if (!validarCNPJ(cnpj)) {
      return res.status(400).json({
        message: 'CNPJ inválido'
      });
    }

    if (!validarCEP(cep)) {
      return res.status(400).json({
        message: 'CEP inválido'
      });
    }

    if (!validarTelefone(telefone)) {
      return res.status(400).json({
        message: 'Telefone inválido'
      });
    }

    const bodyTratado = {
      ...req.body,
      cnpj: limparNumeros(cnpj),
      cep: limparNumeros(cep),
      telefone: limparNumeros(telefone)
    };

    const novoEmpresario = await empresarioService.criarEmpresario(bodyTratado);

    return res.status(201).json(removerSenha(novoEmpresario));
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'CNPJ ou email já cadastrado'
      });
    }

    return res.status(500).json({
      message: 'Erro ao criar empresário',
      error: error.message
    });
  }
};

exports.aprovarEmpresario = async (req, res) => {
  try {
    const idEmpresario = Number(req.params.id);
    const { idAdm } = req.body;

    if (!idAdm) {
      return res.status(400).json({
        message: 'ID do ADM é obrigatório'
      });
    }

    const empresarioAtualizado = await empresarioService.aprovarEmpresario(
      idEmpresario,
      Number(idAdm)
    );

    return res.status(200).json({
      message: 'Empresário aprovado com sucesso',
      empresario: removerSenha(empresarioAtualizado)
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao aprovar empresário',
      error: error.message
    });
  }
};