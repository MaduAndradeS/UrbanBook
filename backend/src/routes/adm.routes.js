const express = require('express');
const router = express.Router();

const admController = require('../controllers/adm.controller');

router.get('/', admController.listarAdms);
router.post('/', admController.criarAdmTeste);

module.exports = router;