const authService = require('../services/auth.service');
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const transporter = require('../mail');

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    const resultado = await authService.login(email, senha);
    return res.status(200).json({
      message: 'Login realizado com sucesso',
      tipo: resultado.tipo,
      usuario: resultado.usuario
    });
  } catch (error) {
    if (error.message === 'Usuário não encontrado' || error.message === 'Senha inválida') {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Erro ao realizar login', error: error.message });
  }
};

exports.esqueciSenha = async (req, res) => {
  const { email } = req.body;
  console.log('email recebido:', email);
  try {
    const cliente = await prisma.cLIENTE.findFirst({ where: { EMAIL: email } });
    console.log('cliente encontrado:', cliente);
    const empresario = !cliente
      ? await prisma.eMPRESARIO.findFirst({ where: { EMAIL: email } })
      
      : null;
      console.log('empresario encontrado:', empresario);

    const usuario = cliente || empresario;
    if (!usuario) return res.status(400).json({ erro: "Usuário não encontrado" });

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expira = new Date(Date.now() + 3600000);

    if (cliente) {
      await prisma.cLIENTE.update({
        where: { ID_CLIENTE: cliente.ID_CLIENTE },
        data: { RESET_TOKEN: codigo, RESET_TOKEN_EXPIRA: expira }
      });
    } else {
      await prisma.eMPRESARIO.update({
        where: { ID_EMPRESARIO: empresario.ID_EMPRESARIO },
        data: { RESET_TOKEN: codigo, RESET_TOKEN_EXPIRA: expira }
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: usuario.EMAIL,
      subject: "Recuperação de senha - Urban Book",
      html: `
        <h2>Recuperação de senha</h2>
        <p>Seu código de verificação é:</p>
        <h1 style="letter-spacing: 8px;">${codigo}</h1>
        <p>Este código expira em 1 hora.</p>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
      `
    });

    return res.status(200).json({ mensagem: "Email enviado com sucesso" });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

exports.redefinirSenha = async (req, res) => {
  const { token, novaSenha } = req.body;
  try {
    if (!token || !novaSenha) return res.status(400).json({ erro: "Campos obrigatórios" });
    if (novaSenha.length < 6) return res.status(400).json({ erro: "Senha muito curta" });

    const cliente = await prisma.cLIENTE.findFirst({
      where: { RESET_TOKEN: token, RESET_TOKEN_EXPIRA: { gt: new Date() } }
    });
    const empresario = !cliente
      ? await prisma.eMPRESARIO.findFirst({
          where: { RESET_TOKEN: token, RESET_TOKEN_EXPIRA: { gt: new Date() } }
        })
      : null;

    const usuario = cliente || empresario;
    if (!usuario) return res.status(400).json({ erro: "Código inválido ou expirado" });

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    if (cliente) {
      await prisma.cLIENTE.update({
        where: { ID_CLIENTE: cliente.ID_CLIENTE },
        data: { SENHA_HASH: senhaHash, RESET_TOKEN: null, RESET_TOKEN_EXPIRA: null }
      });
    } else {
      await prisma.eMPRESARIO.update({
        where: { ID_EMPRESARIO: empresario.ID_EMPRESARIO },
        data: { SENHA_HASH: senhaHash, RESET_TOKEN: null, RESET_TOKEN_EXPIRA: null }
      });
    }

    return res.status(200).json({ mensagem: "Senha redefinida com sucesso" });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};