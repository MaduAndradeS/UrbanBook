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
      // A FOTO_PERFIL já vem por padrão no findMany
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
  // 1. Criar o Cliente com a URL da foto
  const novoCliente = await prisma.cLIENTE.create({
    data: {
      NOME: data.nome,
      CPF: data.cpf,
      DATA_NASC: new Date(data.data_nasc),
      EMAIL: data.email,
      SENHA_HASH: data.senha,
      FOTO_PERFIL: data.foto_perfil, // <-- ADICIONADO AQUI
      ID_EMPRESARIO: data.id_empresario || null
    }
  });

  // 2. Criar o Endereço
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

  // 3. Criar o Telefone
  await prisma.tELEFONE.create({
    data: {
      ID_CLIENTE: novoCliente.ID_CLIENTE,
      TELEFONE: data.telefone
    }
  });

  // 4. Retornar o cliente completo com as relações
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