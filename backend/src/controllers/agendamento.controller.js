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
    
    // Busca agendamentos do dia para esse empresário
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