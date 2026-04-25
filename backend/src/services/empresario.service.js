const prisma = require('../lib/prisma');

// listar empresários com busca, categoria e filtro de aprovados
exports.listarEmpresarios = async (termoBusca, apenasAprovados = false, categoria = null) => {
  const termo = termoBusca?.trim() || undefined;
  const cat = categoria && categoria !== 'Profissionais' ? categoria : undefined;

  const where = {};

  if (apenasAprovados) {
    where.ID_ADM = { not: null };
  }

  if (cat) {
    where.SERVICOS = {
      some: { NOME: cat }
    };
  }

  if (termo) {
    where.OR = [
      { NOME: { contains: termo } },
      { SERVICOS: { some: { NOME: { contains: termo } } } }
    ];
  }

  return await prisma.eMPRESARIO.findMany({
    where,
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true,
      FOTO_TRABALHO: true
    }
  });
};

// listar empresários pendentes
exports.listarEmpresariosPendentes = async () => {
  return await prisma.eMPRESARIO.findMany({
    where: { ID_ADM: null },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true
    }
  });
};

// buscar empresário por id
exports.buscarEmpresarioPorId = async (id) => {
  return await prisma.eMPRESARIO.findUnique({
    where: { ID_EMPRESARIO: id },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true,
      FOTO_TRABALHO: true
    }
  });
};

// criar empresário
exports.criarEmpresario = async (data) => {
  const novoEmpresario = await prisma.eMPRESARIO.create({
    data: {
      NOME: data.nome,
      CNPJ: data.cnpj,
      BIO: data.bio || null,
      EMAIL: data.email,
      SENHA_HASH: data.senha,
      FOTO_PERFIL: data.foto_perfil || null,
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

  return await this.buscarEmpresarioPorId(novoEmpresario.ID_EMPRESARIO);
};

// aprovar empresário
exports.aprovarEmpresario = async (idEmpresario, idAdm) => {
  return await prisma.eMPRESARIO.update({
    where: {
      ID_EMPRESARIO: idEmpresario
    }
  });
};

// salvar disponibilidade
exports.salvarDisponibilidade = async (dados) => {
  const { ID_EMPRESARIO, DURACAO, PERIODOS, DIAS_ATIVOS, BLOQUEIOS } = dados;

  return await prisma.$transaction(async (tx) => {
    await tx.dISPONIBILIDADE.deleteMany({
      where: {
        ID_EMPRESARIO: Number(ID_EMPRESARIO)
      }
    });

    const novaDisp = await tx.dISPONIBILIDADE.create({
      data: {
        ID_EMPRESARIO: Number(ID_EMPRESARIO),
        DURACAO_MIN: Number(DURACAO),
        PERIODOS: PERIODOS,
        DIAS_ATIVOS: DIAS_ATIVOS
      }
    });

    if (BLOQUEIOS && BLOQUEIOS.trim() !== '') {
      const listaBloqueios = BLOQUEIOS.split(',').map((b) => {
        const partes = b.split('T');
        const hora = partes.length > 1 ? partes[1] : b;

        return {
          ID_DISP: novaDisp.ID_DISP,
          HORA_INICIO: hora,
          MOTIVO: 'Bloqueio Manual'
        };
      });

      await tx.bLOQUEIO_DISPONIBILIDADE.createMany({
        data: listaBloqueios
      });
    }

    return novaDisp;
  });
};

// adicionar foto de trabalho
exports.adicionarFotoTrabalho = async (idEmpresario, url) => {
  return await prisma.fOTO_TRABALHO.create({
    data: {
      URL: url,
      ID_EMPRESARIO: idEmpresario
    }
  });
};

// buscar disponibilidade por empresário
exports.buscarDisponibilidadePorId = async (id) => {
  try {
    return await prisma.dISPONIBILIDADE.findFirst({
      where: {
        ID_EMPRESARIO: Number(id)
      }
    });
  } catch (error) {
    console.error('Erro no Prisma ao buscar disponibilidade:', error);
    throw error;
  }
};