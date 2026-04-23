const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');

exports.listarEmpresarios = async () => {
  return await prisma.eMPRESARIO.findMany({
    where: {
      ID_ADM: {
        not: null
      }
    },
    include: {
      ENDERECO: true,
      TELEFONE: true,
      SERVICOS: true
    }
  });
};

exports.listarEmpresariosPendentes = async () => {
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
  const senhaHash = await bcrypt.hash(data.senha, 10);

  return await prisma.eMPRESARIO.create({
    data: {
      NOME: data.nome,
      CNPJ: data.cnpj,
      BIO: data.bio || null,
      EMAIL: data.email,
      SENHA_HASH: senhaHash,
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