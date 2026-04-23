const authService = require('../services/auth.service');

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: 'Email e senha são obrigatórios'
      });
    }

    const resultado = await authService.login(email, senha);

    return res.status(200).json({
  message: 'Login realizado com sucesso',
  tipo: resultado.tipo,
  usuario: resultado.usuario,
  token: resultado.token 
});
  } catch (error) {
    if (
      error.message === 'Usuário não encontrado' ||
      error.message === 'Senha inválida'
    ) {
      return res.status(401).json({
        message: error.message
      });
    }
      console.log("ERRO REAL LOGIN:", error);
    return res.status(500).json({
      message: 'Erro ao realizar login',
      error: error.message
    });
  }
};