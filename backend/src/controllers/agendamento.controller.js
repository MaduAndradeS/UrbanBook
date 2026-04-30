const prisma = require('../lib/prisma');

exports.criarAgendamento = async (req, res) => {
  try {
    const { ID_CLIENTE, ID_EMPRESARIO, DATA_HORA } = req.body;

    const novo = await prisma.aGENDAMENTO.create({
      data: {
        ID_CLIENTE: Number(ID_CLIENTE),
        ID_EMPRESARIO: Number(ID_EMPRESARIO),
        DATA_HORA: new Date(DATA_HORA),
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
    
    const agendamentos = await prisma.aGENDAMENTO.findMany({
      where: {
        ID_EMPRESARIO: Number(id),
        DATA_HORA: {
          gte: new Date(`${data}T00:00:00`),
          lte: new Date(`${data}T23:59:59`),
        },
      },
    });

    const horasOcupadas = agendamentos.map(a => 
      new Date(a.DATA_HORA).toISOString().split('T')[1].substring(0, 5)
    );

    return res.json({ horasOcupadas });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar ocupados" });
  }
};

exports.buscarPorEmpresario = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.query;

    const agendamentos = await prisma.aGENDAMENTO.findMany({
      where: { ID_EMPRESARIO: Number(id) },
      include: { CLIENTE: true }
    });

    const formatados = agendamentos
      .filter(ag => {
        if (!data) return true;
        const dateStr = new Date(ag.DATA_HORA).toISOString().split('T')[0];
        return dateStr === data;
      })
      .map(ag => {
        const dataObj = new Date(ag.DATA_HORA);
        return {
          id: ag.ID_AGENDAMENTO,
          cliente: ag.CLIENTE?.NOME || 'Cliente não identificado',
          foto: ag.CLIENTE?.FOTO_PERFIL || 'https://via.placeholder.com/50',
          hora: dataObj.toISOString().substring(11, 16),
          dataInteira: dataObj.toISOString(),
          servico: 'Serviço Agendado',
          status: ag.STATUS || 'Pendente'
      }});

    return res.json(formatados);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar atendimentos" });
  }
};

exports.buscarPorCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.query;

    const agendamentos = await prisma.aGENDAMENTO.findMany({
      where: { ID_CLIENTE: Number(id) },
      include: { EMPRESARIO: true }
    });

    const formatados = agendamentos
      .filter(ag => {
        if (!data) return true;
        const dateStr = new Date(ag.DATA_HORA).toISOString().split('T')[0];
        return dateStr === data;
      })
      .map(ag => {
        const dataObj = new Date(ag.DATA_HORA);
        return {
          id: ag.ID_AGENDAMENTO,
          empresa: ag.EMPRESARIO?.NOME || 'Empresa não identificada',
          hora: dataObj.toISOString().substring(11, 16),
          dataInteira: dataObj.toISOString(),
          status: ag.STATUS || 'Pendente'
      }});

    return res.json(formatados);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar agendamentos" });
  }
};

// 🟢 FUNÇÕES NOVAS DE APROVAÇÃO
exports.aprovarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const atualizado = await prisma.aGENDAMENTO.update({
      where: { ID_AGENDAMENTO: Number(id) },
      data: { STATUS: 'Confirmado' }
    });
    return res.json(atualizado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao aprovar agendamento" });
  }
};

exports.rejeitarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    // Apaga o agendamento do banco para liberar o horário
    await prisma.aGENDAMENTO.delete({
      where: { ID_AGENDAMENTO: Number(id) }
    });
    return res.json({ sucesso: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao rejeitar agendamento" });
  }
};