const express = require('express');
const router = express.Router();

const empresarioController = require('../controllers/empresario.controller');

router.get('/', empresarioController.listarEmpresarios);
router.get('/pendentes', empresarioController.listarEmpresariosPendentes);
router.get('/:id', empresarioController.buscarEmpresarioPorId);
router.post('/', empresarioController.criarEmpresario);
router.patch('/:id/aprovar', empresarioController.aprovarEmpresario);

module.exports = router;

