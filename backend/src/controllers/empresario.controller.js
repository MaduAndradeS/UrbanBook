const prisma = require('../lib/prisma');
const empresarioService = require('../services/empresario.service');
const cloudinary = require('cloudinary').v2;

const {
  buscarEnderecoPorCep,
  buscarLatitudeLongitude
} = require('../utils/localizacao.utils');

const {
  limparNumeros,
  validarCNPJ,
  validarEmail,
  validarCEP,
  validarTelefone
} = require('../utils/validacoes');

// REMOVE SENHA DO RETORNO
const removerSenha = (empresario) => {

  if (!empresario) return empresario;

  const {
    SENHA_HASH,
    CNPJ,
    CNPJ_HASH,
    ...empresarioSemSenha
  } = empresario;

  return empresarioSemSenha;
};

// REMOVE IMAGEM DO CLOUDINARY CASO HAJA ERRO
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

// LISTAR EMPRESÁRIOS
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

// LISTAR PENDENTES
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

// BUSCAR POR ID
exports.buscarEmpresarioPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'ID inválido'
      });
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

// CRIAR EMPRESÁRIO
exports.criarEmpresario = async (req, res) => {
  try {
    const {
      nome,
      cnpj,
      email,
      senha,
      cep,
      telefone,
      servicos
    } = req.body;

    if (
      !nome ||
      !cnpj ||
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

    if (!coordenadas) {
      await apagarImagemCloudinary(req);

      return res.status(400).json({
        message: 'Não foi possível localizar este endereço no mapa'
      });
    }

    const fotoPerfilUrl = req.file ? req.file.path : null;

    const bodyTratado = {
      ...req.body,
      cnpj: limparNumeros(cnpj),
      cep: enderecoCep.cep,
      telefone: limparNumeros(telefone),

      rua: enderecoCep.rua,
      bairro: enderecoCep.bairro,
      cidade: enderecoCep.cidade,
      estado: enderecoCep.estado,

      latitude: coordenadas.latitude,
      longitude: coordenadas.longitude,

      foto_perfil: fotoPerfilUrl
    };

    const novoEmpresario =
      await empresarioService.criarEmpresario(bodyTratado);

    return res.status(201).json(removerSenha(novoEmpresario));
  } catch (error) {
    await apagarImagemCloudinary(req);

    if (error.code === 'P2002') {
      return res.status(400).json({
        message: 'Email já cadastrado'
      });
    }

    if (error.message == 'CNPJ já cadastrado') {
      return res.status(400).json({
        message: 'CNPJ já cadastrado'
      })
    }

    console.error(error);

    return res.status(500).json({
      message: 'Erro ao criar empresário',
      error: error.message
    });
  }
};

// FOTO DE TRABALHO
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

// APROVAR EMPRESÁRIO
exports.aprovarEmpresario = async (req, res) => {
  try {
    const idEmpresario = Number(req.params.id);
    const { idAdm } = req.body;

    if (!idAdm) {
      return res.status(400).json({
        message: 'ID do ADM é obrigatório'
      });
    }

    const empresarioAtualizado =
      await empresarioService.aprovarEmpresario(
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

// CONFIGURAR DISPONIBILIDADE
exports.configurarDisponibilidade = async (req, res) => {
  try {
    const {
      ID_EMPRESARIO,
      DURACAO_MIN,
      PERIODOS,
      DIAS_ATIVOS
    } = req.body;

    if (
      !ID_EMPRESARIO ||
      !DURACAO_MIN ||
      !PERIODOS ||
      !DIAS_ATIVOS
    ) {
      return res.status(400).json({
        message: 'Dados obrigatórios ausentes.'
      });
    }

    console.log(
      'Dados recebidos para salvar disponibilidade:',
      req.body
    );

    const disponibilidade =
      await empresarioService.salvarDisponibilidade(
        req.body
      );

    return res.status(200).json({
      message: 'Agenda salva com sucesso',
      data: disponibilidade
    });

  } catch (error) {
    console.error(
      'Erro real ao salvar disponibilidade:',
      error
    );

    return res.status(500).json({
      message: 'Erro ao salvar disponibilidade',
      error: error.message
    });
  }
};

// BUSCAR DISPONIBILIDADE
exports.buscarDisponibilidade = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'ID inválido'
      });
    }

    const disponibilidade =
      await empresarioService.buscarDisponibilidadePorId(id);

    if (!disponibilidade || disponibilidade.length === 0) {
      return res.status(404).json({
        message: 'Agenda não configurada'
      });
    }

    return res.status(200).json(disponibilidade);
  } catch (error) {
    console.error(
      'Erro real ao buscar disponibilidade:',
      error
    );

    return res.status(500).json({
      message: 'Erro ao buscar disponibilidade',
      error: error.message
    });
  }
};

// EXCLUIR DISPONIBILIDADE
exports.excluirDisponibilidade = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: 'ID inválido'
      });
    }

    await empresarioService.excluirDisponibilidade(Number(id));

    return res.status(200).json({
      message: 'Disponibilidade excluída com sucesso'
    });

  } catch (error) {
    console.error(
      'Erro ao excluir disponibilidade:',
      error
    );

    return res.status(500).json({
      message: 'Erro ao excluir disponibilidade',
      error: error.message
    });
  }
};

// LISTAR PRÓXIMOS
exports.listarEmpresariosProximos = async (req, res) => {
  try {
    const { lat, lng, raio } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: 'Latitude e longitude são obrigatórias'
      });
    }

    const empresarios =
      await empresarioService.listarEmpresariosProximos(
        Number(lat),
        Number(lng),
        raio ? Number(raio) : 10
      );

    return res.status(200).json(
      empresarios.map(removerSenha)
    );
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar empresários próximos',
      error: error.message
    });
  }
};