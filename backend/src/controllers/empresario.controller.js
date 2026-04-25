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

// 🔎 LISTAR EMPRESÁRIOS (COM BUSCA E CATEGORIA)
exports.listarEmpresarios = async (req, res) => {
  try {
    const { busca, categoria } = req.query;

    const empresarios = await empresarioService.listarEmpresarios(
      busca || undefined, 
      true, 
      categoria || undefined
    );

    return res.status(200).json(empresarios.map(removerSenha));

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

// ➕ CRIAR EMPRESÁRIO
exports.criarEmpresario = async (req, res) => {
  try {
    const {
      nome, cnpj, email, senha, rua, bairro, cidade, estado, cep, telefone, servicos
    } = req.body;

    if (!nome || !cnpj || !email || !senha || !rua || !bairro || !cidade || !estado || !cep || !telefone) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    const fotoPerfilUrl = req.file ? req.file.path : null;

    if (!validarCNPJ(cnpj)) return res.status(400).json({ message: 'CNPJ inválido' });
    if (!validarCEP(cep)) return res.status(400).json({ message: 'CEP inválido' });
    if (!validarTelefone(telefone)) return res.status(400).json({ message: 'Telefone inválido' });

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

    // 🚨 Deleta foto de perfil se deu erro
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
        console.log("Imagem de perfil deletada do Cloudinary");
      } catch (e) {
        console.error("Erro ao deletar imagem:", e);
      }
    }

    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'CNPJ ou email já cadastrado' });
    }

    return res.status(500).json({
      message: 'Erro ao criar empresário',
      error: error.message
    });
  }
};

// ✅ APROVAR EMPRESÁRIO
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

// 📅 CONFIGURAR AGENDA / DISPONIBILIDADE (COM DEDO DURO)
exports.configurarDisponibilidade = async (req, res) => {
  console.log("=========================================");
  console.log("📅 [AGENDA] 1. O celular bateu na porta do servidor!");
  console.log("📅 [AGENDA] 2. O que o celular mandou:", req.body);

  try {
    // Puxa tudo que veio do aplicativo
    const { id_empresario, id, ID_EMPRESARIO, dia_semana, hora_inicio, hora_fim } = req.body;
    
    // Tenta achar o ID de qualquer jeito que ele tenha vindo
    const empresarioId = id_empresario || id || ID_EMPRESARIO;

    if (!empresarioId) {
       console.log("🔴 [AGENDA] ERRO: Não achei o ID na requisição!");
       return res.status(400).json({ message: 'ID do empresário é obrigatório' });
    }

    console.log("📅 [AGENDA] 3. Tentando salvar no banco para o ID:", empresarioId);
    
// Tenta salvar usando APENAS as colunas que realmente existem no seu banco
    const novaDisponibilidade = await prisma.dISPONIBILIDADE.create({
      data: {
        ID_EMPRESARIO: Number(empresarioId),
        DIAS_ATIVOS: dia_semana,                   // Salva "Seg"
        PERIODOS: `${hora_inicio} às ${hora_fim}`  // Salva "07:00 às 08:00"
      }
    });

    console.log("📅 [AGENDA] 4. Salvo com sucesso no banco!");
    return res.status(201).json(novaDisponibilidade);

  } catch (error) {
    console.error("🔴 [AGENDA] ERRO FATAL DO PRISMA:", error);
    return res.status(500).json({ 
      message: 'Erro ao processar sua agenda no servidor.', 
      detalhes: error.message 
    });
  }
};
// 💼 ADICIONAR FOTO DE TRABALHO
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

    // 🚨 Deleta foto de trabalho se deu erro
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
        console.log("Foto de trabalho deletada do Cloudinary");
      } catch (e) {
        console.error("Erro ao deletar foto:", e);
      }
    }

    return res.status(500).json({
      message: 'Erro ao subir foto do trabalho',
      error: error.message
    });
  }
};

// 🔍 BUSCAR A AGENDA (Resolve o bug de sumir ao atualizar)
exports.buscarDisponibilidade = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Buscando agenda para o empresário:", id);

    const agenda = await prisma.dISPONIBILIDADE.findMany({
      where: { ID_EMPRESARIO: Number(id) }
    });

    return res.status(200).json(agenda);
  } catch (error) {
    console.error("🔴 Erro ao buscar agenda:", error);
    return res.status(500).json({ error: "Erro ao buscar agenda no banco" });
  }
};

// 🗑️ DELETAR UM HORÁRIO 
exports.deletarDisponibilidade = async (req, res) => {
  try {
    const { id_dispo } = req.params;
    console.log("🗑️ Tentando apagar o horário ID:", id_dispo);

    if (!id_dispo || id_dispo === 'undefined') {
      return res.status(400).json({ error: "ID do horário não foi enviado" });
    }

    // A correção está aqui: a coluna chama-se ID_DISP
    await prisma.dISPONIBILIDADE.delete({
      where: { ID_DISP: Number(id_dispo) }
    });

    console.log("✅ Horário apagado com sucesso!");
    return res.status(200).json({ message: "Horário apagado com sucesso" });
  } catch (error) {
    console.error("🔴 Erro ao apagar horário no Prisma:", error);
    return res.status(500).json({ error: "Erro ao apagar horário" });
  }
};