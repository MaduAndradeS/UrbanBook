const prisma = require('../lib/prisma');

exports.criarAgendamento = async (req, res) => {
  try {
    const { ID_CLIENTE, ID_EMPRESARIO, DATA_HORA } = req.body;

    const novo = await prisma.aGENDAMENTO.create({
      data: {
        ID_CLIENTE: Number(ID_CLIENTE),
        ID_EMPRESARIO: Number(ID_EMPRESARIO),
        DATA_HORA: new Date(DATA_HORA),
        CONFIRMACAO: false,
        CANCELAMENTO: false
      },
    });

    return res.status(201).json(novo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao criar agendamento" });
  }
};

exports.verificarOcupados = async (req, res) => {
  try {
    const { id, data } = req.query;
    
    // Busca os agendamentos das 00:00 até 23:59 do dia solicitado no fuso do Brasil
    const agendamentos = await prisma.aGENDAMENTO.findMany({
      where: {
        ID_EMPRESARIO: Number(id),
        DATA_HORA: {
          gte: new Date(`${data}T00:00:00-03:00`),
          lte: new Date(`${data}T23:59:59-03:00`),
        },
      },
    });

    // Ignora os cancelados e devolve a hora ajustada para o calendário do aplicativo bloquear
    const horasOcupadas = agendamentos
      .filter(a => a.CANCELAMENTO !== true)
      .map(a => {
        const d = new Date(a.DATA_HORA);
        d.setUTCHours(d.getUTCHours() - 3); // Puxa para o horário de Brasília
        return d.toISOString().split('T')[1].substring(0, 5);
      });

    return res.json({ horasOcupadas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar ocupados" });
  }
};

exports.buscarPorEmpresario = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.query;

    // AGORA DEVOLVE O FORMATO ORIGINAL DO PRISMA COM A CONEXÃO COMPLETA DO CLIENTE
    const agendamentos = await prisma.aGENDAMENTO.findMany({
      where: { ID_EMPRESARIO: Number(id) },
      include: { CLIENTE: true }
    });

    let resultado = agendamentos;
    if (data) {
      resultado = agendamentos.filter(ag => {
        if (!ag.DATA_HORA) return false;
        const d = new Date(ag.DATA_HORA);
        d.setUTCHours(d.getUTCHours() - 3);
        return d.toISOString().split('T')[0] === data;
      });
    }

    return res.json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar atendimentos" });
  }
};

exports.buscarPorCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.query;

    // DEVOLVE OS DADOS ORIGINAIS PARA O FRONTEND CONSEGUIR LER A CHECKBOX DE CONFIRMAÇÃO
    const agendamentos = await prisma.aGENDAMENTO.findMany({
      where: { ID_CLIENTE: Number(id) },
      include: { EMPRESARIO: true }
    });

    let resultado = agendamentos;
    if (data) {
      resultado = agendamentos.filter(ag => {
         if (!ag.DATA_HORA) return false;
         const d = new Date(ag.DATA_HORA);
         d.setUTCHours(d.getUTCHours() - 3);
         return d.toISOString().split('T')[0] === data;
      });
    }

    return res.json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar agendamentos" });
  }
};

exports.aprovarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const atualizado = await prisma.aGENDAMENTO.update({
      where: {
        ID_AGENDAMENTO: Number(id)
      },
      data: {
        CONFIRMACAO: true,
        CANCELAMENTO: false
      }
    });
    return res.json(atualizado);
  } catch (error) {
    console.error("Erro ao aprovar agendamento:", error);
    return res.status(500).json({ erro: 'Erro ao aprovar agendamento' });
  }
};

exports.rejeitarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deleta do banco para libertar o horário para outro cliente
    await prisma.aGENDAMENTO.delete({
      where: { ID_AGENDAMENTO: Number(id) }
    });
    
    return res.json({ sucesso: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao rejeitar agendamento" });
  }
};