const prisma = require('../lib/prisma');


// ==============================
// 🔎 LISTAR CLIENTES COM BUSCA
// ==============================
exports.listarClientes = async (termoBusca) => {
  return await prisma.cLIENTE.findMany({
    where: {
      ...(termoBusca && {
        OR: [
          { NOME: { contains: termoBusca, mode: 'insensitive' } },
          { EMAIL: { contains: termoBusca, mode: 'insensitive' } }
        ]
      })
    },
    include: {
      ENDERECO: true,
      TELEFONE: true
    }
  });
};


// ==============================
// 🎯 BUSCAR CLIENTE POR ID
// ==============================
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


// ==============================
// ➕ CRIAR CLIENTE (COMPLETO)
// ==============================
exports.criarCliente = async (data) => {
  const novoCliente = await prisma.cLIENTE.create({
    data: {
      NOME: data.nome,
      CPF: data.cpf,
      DATA_NASC: new Date(data.data_nasc),
      EMAIL: data.email,
      SENHA_HASH: data.senha,
      ID_EMPRESARIO: data.id_empresario || null
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