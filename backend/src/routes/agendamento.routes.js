const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamento.controller');

// Como no index.js você já usou '/agendamentos', aqui fica só '/'
router.post('/', agendamentoController.criarAgendamento);
router.get('/check', agendamentoController.verificarOcupados);

module.exports = router;