const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/cliente.controller');

router.get('/', clienteController.listarClientes);
router.get('/:id', clienteController.buscarClientePorId);
router.post('/', clienteController.criarCliente);

module.exports = router;