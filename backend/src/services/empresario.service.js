const prisma = require('../lib/prisma');



exports.listarEmpresarios = async (termoBusca, apenasAprovados = false, categoria = null) => {
  // Converte strings vazias em undefined para o Prisma ignorar o filtro se não houver valor
  const termo = termoBusca?.trim() || undefined;
  const cat = (categoria && categoria !== 'Profissionais') ? categoria : undefined;

  const where = {};

  // 1. Filtro de Aprovados (ID_ADM) 
  if (apenasAprovados) {
    where.ID_ADM = { not: null };
  }

  // 2. Filtro de Categoria (Relacionamento SERVICOS) 
  if (cat) {
    where.SERVICOS = {
      some: {
        NOME: cat // MySQL com Prisma às vezes nega 'mode' em relações complexas, tente assim primeiro
      }
    };
  }

  // 3. Filtro de Busca (Texto livre)
  if (termo) {
    where.OR = [
      { NOME: { contains: termo } },
      { SERVICOS: { some: { NOME: { contains: termo } } } }
    ];
  }

  // Usa eMPRESARIO exatamente como no schema 
  return await prisma.eMPRESARIO.findMany({
    where,
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true
    }
  });
};


exports.buscarEmpresarioPorId = async (id) => {
  return await prisma.eMPRESARIO.findUnique({
    where: {
      ID_EMPRESARIO: id
    },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true
    }
  });
};



exports.criarEmpresario = async (data) => {
  const novoEmpresario = await prisma.eMPRESARIO.create({
    data: {
      NOME: data.nome,
      CNPJ: data.cnpj,
      BIO: data.bio || null,
      EMAIL: data.email,
      SENHA_HASH: data.senha,
      ID_ADM: null
    }
  });

  await prisma.eNDERECO.create({
    data: {
      ID_EMPRESARIO: novoEmpresario.ID_EMPRESARIO,
      RUA: data.rua,
      NUM: data.num ? Number(data.num) : null,
      BAIRRO: data.bairro,
      CIDADE: data.cidade,
      ESTADO: data.estado,
      CEP: data.cep,
      COMP: data.comp || null
    }
  });

  await prisma.tELEFONE.create({
    data: {
      ID_EMPRESARIO: novoEmpresario.ID_EMPRESARIO,
      TELEFONE: data.telefone
    }
  });

  if (Array.isArray(data.servicos) && data.servicos.length > 0) {
    for (const nomeServico of data.servicos) {
      await prisma.sERVICOS.create({
        data: {
          NOME: nomeServico,
          ID_EMPRESARIO: novoEmpresario.ID_EMPRESARIO
        }
      });
    }
  }

  return await prisma.eMPRESARIO.findUnique({
    where: {
      ID_EMPRESARIO: novoEmpresario.ID_EMPRESARIO
    },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true
    }
  });
};


exports.aprovarEmpresario = async (idEmpresario, idAdm) => {
  return await prisma.eMPRESARIO.update({
    where: {
      ID_EMPRESARIO: idEmpresario
    },
    data: {
      ID_ADM: idAdm
    },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true
    }
  });
};



exports.listarPendentes = async () => {
  return await prisma.eMPRESARIO.findMany({
    where: {
      ID_ADM: null
    },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true
    }
  });
};