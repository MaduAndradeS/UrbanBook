const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamento.controller');

router.post('/', agendamentoController.criarAgendamento);
router.get('/check', agendamentoController.verificarOcupados);

module.exports = router;