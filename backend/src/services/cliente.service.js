const prisma = require('../lib/prisma');

exports.listarClientes = async () => {
  return await prisma.cLIENTE.findMany();
};

exports.buscarClientePorId = async (id) => {
  return await prisma.cLIENTE.findUnique({
    where: {
      ID_CLIENTE: id
    }
  });
};

exports.criarCliente = async (data) => {
  return await prisma.cLIENTE.create({
    data: {
      NOME: data.nome,
      CPF: data.cpf,
      DATA_NASC: new Date(data.data_nasc),
      EMAIL: data.email,
      SENHA_HASH: data.senha,
      ID_EMPRESARIO: data.id_empresario || null
    }
  });
};