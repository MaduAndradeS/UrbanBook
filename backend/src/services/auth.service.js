exports.register = async (data) => {
  const { nome, email, senha, tipo } = data;

  if (!nome || !email || !senha || !tipo) {
    throw new Error('Todos os campos são obrigatórios');
  }

  return {
    message: 'Cadastro recebido com sucesso',
    user: {
      nome,
      email,
      tipo
    }
  };
};