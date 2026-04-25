const empresarioService = require('../services/empresario.service');
const cloudinary = require('cloudinary').v2;
const prisma = require('../lib/prisma');

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

exports.listarEmpresarios = async (req, res) => {
  try {
    const { busca, categoria } = req.query;

    const empresarios = await empresarioService.listarEmpresarios(
      busca,
      true,
      categoria
    );

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

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

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
      await apagarImagemCloudinary(req);
      return res.status(400).json({
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    if (!Array.isArray(servicos) || servicos.length === 0) {
      await apagarImagemCloudinary(req);
      return res.status(400).json({
        message: 'Selecione pelo menos um serviço'
      });
    }

    if (!validarCNPJ(cnpj)) {
      await apagarImagemCloudinary(req);
      return res.status(400).json({
        message: 'CNPJ inválido'
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

    const fotoPerfilUrl = req.file ? req.file.path : null;

    const bodyTratado = {
      ...req.body,
      cnpj: limparNumeros(cnpj),
      cep: limparNumeros(cep),
      telefone: limparNumeros(telefone),
      foto_perfil: fotoPerfilUrl
    };

    const novoEmpresario = await empresarioService.criarEmpresario(bodyTratado);

    return res.status(201).json(removerSenha(novoEmpresario));
  } catch (error) {
    await apagarImagemCloudinary(req);

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

exports.adicionarFotoTrabalho = async (req, res) => {
  try {
    const { id_empresario } = req.body;

    if (!id_empresario) {
      await apagarImagemCloudinary(req);
      return res.status(400).json({
        message: 'ID do empresário é obrigatório'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Nenhuma foto enviada'
      });
    }

    const fotoUrl = req.file.path;

    const novaFoto = await empresarioService.adicionarFotoTrabalho(
      Number(id_empresario),
      fotoUrl
    );

    return res.status(201).json({
      message: 'Foto adicionada com sucesso',
      foto: novaFoto
    });
  } catch (error) {
    await apagarImagemCloudinary(req);

    return res.status(500).json({
      message: 'Erro ao enviar foto de trabalho',
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

exports.configurarDisponibilidade = async (req, res) => {
  try {
    const { ID_EMPRESARIO } = req.body;

    if (!ID_EMPRESARIO) {
      return res.status(400).json({
        message: 'ID do empresário não informado'
      });
    }

    const resultado = await empresarioService.salvarDisponibilidade(req.body);

    return res.status(200).json({
      message: 'Agenda salva com sucesso',
      data: resultado
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao salvar disponibilidade',
      error: error.message
    });
  }
};

exports.buscarDisponibilidade = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const disponibilidade = await empresarioService.buscarDisponibilidadePorId(id);

    if (!disponibilidade) {
      return res.status(404).json({
        message: 'Agenda não configurada'
      });
    }

    return res.status(200).json(disponibilidade);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar disponibilidade',
      error: error.message
    });
  }
};
// 🔐 LOGIN DO EMPRESÁRIO
exports.loginEmpresario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Busca o empresário no banco (ajuste o SENHA_HASH se vcs usarem outro nome)
    const empresario = await prisma.eMPRESARIO.findFirst({
      where: { EMAIL: email, SENHA_HASH: senha } 
    });

    if (!empresario) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    // REGRA DA JÚLIA: Bloquear se não estiver aprovado
    if (empresario.ID_ADM === null) {
      return res.status(403).json({ error: "Sua conta ainda não foi aprovada pela administração!" });
    }

    // Se deu tudo certo, devolve o ID dele
    return res.status(200).json({ id: empresario.ID_EMPRESARIO, tipo: 'empresario' });

  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};