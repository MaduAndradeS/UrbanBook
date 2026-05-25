const prisma = require('../lib/prisma');
const geocodingService = require('./geocoding.service');
const bcrypt = require('bcryptjs');

const crypto = require("crypto");

const transporter = require("../mail");

const {
  criptografar,
  hashValor
} = require('../utils/crypto.util.js');

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

  const cpfHash =
    hashValor(data.cpf);

  // VERIFICAR DUPLICIDADE
  const cpfExistente =
    await prisma.cLIENTE.findFirst({
      where: {
        CPF_HASH: cpfHash
      }
    });

  if (cpfExistente) {
    throw new Error('CPF já cadastrado');
  }

  // CRIAR CLIENTE
  const novoCliente =
    await prisma.cLIENTE.create({

      data: {

        NOME: data.nome,

        // CPF CRIPTOGRAFADO
        CPF: criptografar(data.cpf),

        // HASH PARA BUSCA
        CPF_HASH: cpfHash,

        DATA_NASC: new Date(data.data_nasc),

        EMAIL: data.email,

        SENHA_HASH: senhaHash,

        FOTO_PERFIL:
          data.foto_perfil || null,

        ID_EMPRESARIO:
          data.id_empresario || null
      }
    });



  // BUSCAR COORDENADAS
  const coordenadas =
    await geocodingService.buscarCoordenadas({

      rua: data.rua,
      num: data.num,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      cep: data.cep
    });



  // ENDEREÇO
  await prisma.eNDERECO.create({

    data: {

      ID_CLIENTE:
        novoCliente.ID_CLIENTE,

      RUA: data.rua,

      NUM:
        data.num
          ? Number(data.num)
          : null,

      BAIRRO: data.bairro,

      CIDADE: data.cidade,

      ESTADO: data.estado,

      CEP: data.cep,

      COMP:
        data.comp || null,

      LATITUDE:
        coordenadas.latitude,

      LONGITUDE:
        coordenadas.longitude
    }
  });



  // TELEFONE
  await prisma.tELEFONE.create({

    data: {

      ID_CLIENTE:
        novoCliente.ID_CLIENTE,

      TELEFONE:
        data.telefone
    }
  });



  // RETORNAR CLIENTE
  return await prisma.cLIENTE.findUnique({

    where: {
      ID_CLIENTE:
        novoCliente.ID_CLIENTE
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

exports.esqueciSenha = async (email) => {
  const cliente = await prisma.cLIENTE.findFirst({
    where: { EMAIL: email }
  });

  if (!cliente) throw new Error("Usuário não encontrado");

  // Código de 6 dígitos
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.cLIENTE.update({
    where: { ID_CLIENTE: cliente.ID_CLIENTE },
    data: {
      RESET_TOKEN: codigo,
      RESET_TOKEN_EXPIRA: new Date(Date.now() + 3600000)
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: cliente.EMAIL,
    subject: "Recuperação de senha - Urban Book",
    html: `
      <h2>Recuperação de senha</h2>
      <p>Seu código de verificação é:</p>
      <h1 style="letter-spacing: 8px;">${codigo}</h1>
      <p>Este código expira em 1 hora.</p>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    `
  });

  return { mensagem: "Email enviado com sucesso" };
};

exports.redefinirSenha = async (token, novaSenha) => {
  const cliente = await prisma.cLIENTE.findFirst({
    where: {
      RESET_TOKEN: token,
      RESET_TOKEN_EXPIRA: { gt: new Date() }
    }
  });

  if (!cliente) throw new Error("Código inválido ou expirado");

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  await prisma.cLIENTE.update({
    where: { ID_CLIENTE: cliente.ID_CLIENTE },
    data: {
      SENHA_HASH: senhaHash,
      RESET_TOKEN: null,
      RESET_TOKEN_EXPIRA: null
    }
  });

  return { mensagem: "Senha redefinida com sucesso" };
};