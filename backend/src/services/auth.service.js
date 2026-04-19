const prisma = require('../lib/prisma');

exports.login = async (email, senha) => {
  const cliente = await prisma.cLIENTE.findUnique({
    where: {
      EMAIL: email
    }
  });

  if (cliente) {
    if (cliente.SENHA_HASH !== senha) {
      throw new Error('Senha inválida');
    }

    const { SENHA_HASH, ...clienteSemSenha } = cliente;

    return {
      tipo: 'CLIENTE',
      usuario: clienteSemSenha
    };
  }

  const empresario = await prisma.eMPRESARIO.findUnique({
    where: {
      EMAIL: email
    }
  });

  if (empresario) {
    if (empresario.SENHA_HASH !== senha) {
      throw new Error('Senha inválida');
    }

    const { SENHA_HASH, ...empresarioSemSenha } = empresario;

    return {
      tipo: 'EMPRESARIO',
      usuario: empresarioSemSenha
    };
  }

  throw new Error('Usuário não encontrado');
};