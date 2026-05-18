const prisma = require('../lib/prisma');
const geocodingService = require('./geocoding.service');
const bcrypt = require('bcryptjs');

// listar clientes com busca opcional
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

// buscar cliente por id
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

// criar cliente
exports.criarCliente = async (data) => {

  const senhaHash = await bcrypt.hash(
    data.senha,
    10
  );

  const novoCliente = await prisma.cLIENTE.create({
    data: {
      NOME: data.nome,
      CPF: data.cpf,
      DATA_NASC: new Date(data.data_nasc),
      EMAIL: data.email,

      // AGORA CRIPTOGRAFADA
      SENHA_HASH: senhaHash,

      FOTO_PERFIL: data.foto_perfil || null,
      ID_EMPRESARIO: data.id_empresario || null
    }
  });

  const coordenadas = await geocodingService.buscarCoordenadas({
    rua: data.rua,
    num: data.num,
    bairro: data.bairro,
    cidade: data.cidade,
    estado: data.estado,
    cep: data.cep
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
      COMP: data.comp || null,

      LATITUDE: coordenadas.latitude,
      LONGITUDE: coordenadas.longitude
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

// ATUALIZAR CLIENTE (AGORA FORA DO CRIAR CLIENTE)
exports.atualizarCliente = async (id, dados) => {
  return await prisma.cLIENTE.update({
    where: { ID_CLIENTE: Number(id) },
    data: {
      NOME: dados.nome,
      TELEFONE: {
        deleteMany: {}, 
        create: { TELEFONE: dados.telefone }
      }
    },
    include: { TELEFONE: true, ENDERECO: true }
  });
};