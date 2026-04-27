const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamento.controller');

router.post('/', agendamentoController.criarAgendamento);
router.get('/check', agendamentoController.verificarOcupados);
router.get('/empresario/:id', agendamentoController.buscarPorEmpresario);
router.get('/cliente/:id', agendamentoController.buscarPorCliente);

// 🟢 ROTAS NOVAS DE APROVAÇÃO E REJEIÇÃO
router.put('/:id/aprovar', agendamentoController.aprovarAgendamento);
router.delete('/:id/rejeitar', agendamentoController.rejeitarAgendamento);

module.exports = router;