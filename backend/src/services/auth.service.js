const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "segredo";
console.log("PRISMA NO SERVICE:", prisma);
console.log(Object.keys(prisma));
exports.login = async (email, senha) => {
  const cliente = await prisma.cLIENTE.findUnique({
    where: { EMAIL: email }
  });

  if (cliente) {
    const senhaValida = await bcrypt.compare(
      senha,
      cliente.SENHA_HASH
    );

    if (!senhaValida) {
      throw new Error('Senha inválida');
    }

    const { SENHA_HASH, ...clienteSemSenha } = cliente;

    const token = jwt.sign(
      { id: cliente.ID_CLIENTE, tipo: 'CLIENTE' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      tipo: 'CLIENTE',
      usuario: clienteSemSenha,
      token
    };
  }

  exports.registerCliente = async (email, senha) => {
  const existe = await prisma.cLIENTE.findUnique({
    where: { EMAIL: email }
  });

  if (existe) {
    throw new Error('Usuário já existe');
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const cliente = await prisma.cLIENTE.create({
    data: {
      EMAIL: email,
      SENHA_HASH: senhaHash
    }
  });

  const { SENHA_HASH, ...clienteSemSenha } = cliente;

  return clienteSemSenha;
};

  const empresario = await prisma.eMPRESARIO.findUnique({
    where: { EMAIL: email }
  });

  if (empresario) {
    const senhaValida = await bcrypt.compare(
      senha,
      empresario.SENHA_HASH
    );

    if (!senhaValida) {
      throw new Error('Senha inválida');
    }

    const { SENHA_HASH, ...empresarioSemSenha } = empresario;

    const token = jwt.sign(
      { id: empresario.ID_EMPRESARIO, tipo: 'EMPRESARIO' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      tipo: 'EMPRESARIO',
      usuario: empresarioSemSenha,
      token
    };
  }

<<<<<<< Updated upstream
=======
  exports.registerEmpresario = async (email, senha) => {
  const existe = await prisma.eMPRESARIO.findUnique({
    where: { EMAIL: email }
  });

  if (existe) {
    throw new Error('Usuário já existe');
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const empresario = await prisma.eMPRESARIO.create({
    data: {
      EMAIL: email,
      SENHA_HASH: senhaHash
    }
  });

  const { SENHA_HASH, ...empresarioSemSenha } = empresario;

  return empresarioSemSenha;
};


  if (email === 'adm@urbanbook.com' && senha === '123456') {
    const adm = await prisma.aDM.findFirst();

    const token = jwt.sign(
      { id: adm.ID_ADM, tipo: 'ADM' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      tipo: 'ADM',
      usuario: adm,
      token
    };
  }

>>>>>>> Stashed changes
  throw new Error('Usuário não encontrado');
};