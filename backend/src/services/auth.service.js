const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

exports.login = async (email, senha) => {

  // CLIENTE
  const cliente = await prisma.cLIENTE.findUnique({
    where: {
      EMAIL: email
    }
  });

  if (cliente) {

    const senhaCorreta = await bcrypt.compare(
      senha,
      cliente.SENHA_HASH
    );

    if (!senhaCorreta) {
      throw new Error('Senha inválida');
    }

    const { SENHA_HASH, ...clienteSemSenha } = cliente;

    return {
      tipo: 'CLIENTE',
      usuario: clienteSemSenha
    };
  }

  // EMPRESÁRIO
  const empresario = await prisma.eMPRESARIO.findUnique({
    where: {
      EMAIL: email
    }
  });

  if (empresario) {

    const senhaCorreta = await bcrypt.compare(
      senha,
      empresario.SENHA_HASH
    );

    if (!senhaCorreta) {
      throw new Error('Senha inválida');
    }

    const {
      SENHA_HASH,
      ...empresarioSemSenha
    } = empresario;

    return {
      tipo: 'EMPRESARIO',
      usuario: empresarioSemSenha
    };
  }

  // ADM
  const adm = await prisma.aDM.findFirst();

  if (adm) {

    if (
      email === 'adm@urbanbook.com' &&
      senha === '123456'
    ) {

      return {
        tipo: 'ADM',
        usuario: adm
      };
    }
  }

  throw new Error('Usuário não encontrado');
};