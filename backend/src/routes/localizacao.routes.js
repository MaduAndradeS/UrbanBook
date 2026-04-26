const express = require('express');
const router = express.Router();

const localizacaoController = require('../controllers/localizacao.controller');

router.get('/buscar', localizacaoController.buscarLocalizacao);

module.exports = router;