const express = require('express');
const router = express.Router();

const empresarioController = require('../controllers/empresario.controller');

router.get('/', empresarioController.listarEmpresarios);
router.get('/:id', empresarioController.buscarEmpresarioPorId);
router.post('/', empresarioController.criarEmpresario);

module.exports = router;