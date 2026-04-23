const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');

exports.listarClientes = async () => {
  return await prisma.cLIENTE.findMany({
    include: {
      ENDERECO: true,
      TELEFONE: true
    }
  });
};

exports.buscarClientePorId = async (id) => {
  return await prisma.cLIENTE.findUnique({
    where: {
      ID_CLIENTE: id
    },
    include: {
      ENDERECO: true,
      TELEFONE: true
    }
  });
};

exports.criarCliente = async (dados) => {
  const senhaHash = await bcrypt.hash(dados.senha, 10);

  return await prisma.cLIENTE.create({
    data: {
      EMAIL: dados.email,
      SENHA_HASH: senhaHash,
      NOME: dados.nome,
      CPF: dados.cpf,
      DATA_NASC: new Date(dados.data_nasc),
    }
  });
  await prisma.eNDERECO.create({
    data: {
      ID_CLIENTE: novoCliente.ID_CLIENTE,
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
      ID_CLIENTE: novoCliente.ID_CLIENTE,
      TELEFONE: data.telefone
    }
  });

  return await prisma.cLIENTE.findUnique({
    where: {
      ID_CLIENTE: novoCliente.ID_CLIENTE
    },
    include: {
      ENDERECO: true,
      TELEFONE: true
    }
  });
};