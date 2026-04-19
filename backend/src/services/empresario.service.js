const prisma = require('../lib/prisma');

exports.listarEmpresarios = async () => {
  return await prisma.eMPRESARIO.findMany();
};

exports.buscarEmpresarioPorId = async (id) => {
  return await prisma.eMPRESARIO.findUnique({
    where: {
      ID_EMPRESARIO: id
    }
  });
};

exports.criarEmpresario = async (data) => {
  return await prisma.eMPRESARIO.create({
    data: {
      NOME: data.nome,
      CNPJ: data.cnpj,
      BIO: data.bio || null,
      EMAIL: data.email,
      SENHA_HASH: data.senha,
      ID_ADM: data.id_adm || null
    }
  });
};