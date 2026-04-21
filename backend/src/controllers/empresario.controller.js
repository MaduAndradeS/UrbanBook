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

// 🔎 LISTAR EMPRESÁRIOS (COM BUSCA E CATEGORIA)
exports.listarEmpresarios = async (req, res) => {
  try {
    const { busca, categoria } = req.query;

    const empresarios = await empresarioService.listarEmpresarios(
      busca || undefined, 
      true, 
      categoria || undefined
    );

    const empresariosSemSenha = empresarios.map(removerSenha);
    return res.status(200).json(empresariosSemSenha);

  } catch (error) {
    console.error("❌ Erro no Prisma:", error);
    return res.status(500).json({ 
      message: 'Erro ao listar empresários', 
      error: error.message 
    });
  }
};

// ⏳ LISTAR EMPRESÁRIOS PENDENTES
exports.listarEmpresariosPendentes = async (req, res) => {
  try {
    const empresarios = await empresarioService.listarEmpresarios(null, false);
    const pendentes = empresarios.filter(e => e.ID_ADM === null);

    return res.status(200).json(pendentes.map(removerSenha));
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao listar empresários pendentes',
      error: error.message
    });
  }
};

// 🎯 BUSCAR POR ID
exports.buscarEmpresarioPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const empresario = await empresarioService.buscarEmpresarioPorId(id);

    if (!empresario) {
      return res.status(404).json({ message: 'Empresário não encontrado' });
    }

    return res.status(200).json(removerSenha(empresario));
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar empresário',
      error: error.message
    });
  }
};

/// ➕ CRIAR EMPRESÁRIO
exports.criarEmpresario = async (req, res) => {
  try {
    const {
      nome, cnpj, email, senha, rua, bairro, cidade, estado, cep, telefone, servicos
    } = req.body;

    if (!nome || !cnpj || !email || !senha || !rua || !bairro || !cidade || !estado || !cep || !telefone) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Captura a foto de perfil do Cloudinary
    const fotoPerfilUrl = req.file ? req.file.path : null;

    if (!validarCNPJ(cnpj)) return res.status(400).json({ message: 'CNPJ inválido' });
    if (!validarCEP(cep)) return res.status(400).json({ message: 'CEP inválido' });
    if (!validarTelefone(telefone)) return res.status(400).json({ message: 'Telefone inválido' });

    const bodyTratado = {
      ...req.body,
      cnpj: limparNumeros(cnpj),
      cep: limparNumeros(cep),
      telefone: limparNumeros(telefone),
      foto_perfil: fotoPerfilUrl // Enviando a URL para o service
    };

    const novoEmpresario = await empresarioService.criarEmpresario(bodyTratado);
    return res.status(201).json(removerSenha(novoEmpresario));

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'CNPJ ou email já cadastrado' });
    }
    return res.status(500).json({
      message: 'Erro ao criar empresário',
      error: error.message
    });
  }
};

// ✅ APROVAR EMPRESÁRIO (ADM)
exports.aprovarEmpresario = async (req, res) => {
  try {
    const idEmpresario = Number(req.params.id);
    const { idAdm } = req.body;

    if (!idAdm) {
      return res.status(400).json({ message: 'ID do ADM é obrigatório' });
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

// 📅 CONFIGURAR DISPONIBILIDADE
exports.configurarDisponibilidade = async (req, res) => {
  try {
    const { ID_EMPRESARIO } = req.body;

    if (!ID_EMPRESARIO) {
      return res.status(400).json({ message: "ID do empresário não informado." });
    }

    const resultado = await empresarioService.salvarDisponibilidade(req.body);
    
    return res.status(200).json({
      message: "Agenda salva com sucesso!",
      data: resultado
    });
  } catch (error) {
    console.error("❌ Erro ao salvar agenda:", error);
    return res.status(500).json({ 
      message: "Erro ao processar sua agenda no servidor.",
      error: error.message 
    });
  }
};

// 💼 ADICIONAR FOTO DE TRABALHO (PORTFÓLIO)
exports.adicionarFotoTrabalho = async (req, res) => {
  try {
    const { id_empresario } = req.body;

    if (!id_empresario) {
      return res.status(400).json({ message: 'ID do empresário é obrigatório' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma foto enviada' });
    }

    const fotoTrabalhoUrl = req.file.path;

    const novaFoto = await empresarioService.adicionarFotoTrabalho(
      Number(id_empresario), 
      fotoTrabalhoUrl
    );

    return res.status(201).json({
      message: 'Foto adicionada ao portfólio com sucesso!',
      foto: novaFoto
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao subir foto do trabalho',
      error: error.message
    });
  }
};

exports.buscarDisponibilidade = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const disponibilidade = await empresarioService.buscarDisponibilidadePorId(id);

    if (!disponibilidade) {
      return res.status(404).json({ message: "Agenda não configurada." });
    }

    return res.status(200).json(disponibilidade);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar agenda." });
  }
};