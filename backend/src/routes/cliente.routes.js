const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/cliente.controller');

// 🔎 LISTAR + BUSCAR
router.get('/', clienteController.listarClientes);

// 🎯 BUSCAR POR ID
router.get('/:id', clienteController.buscarClientePorId);

// ➕ CRIAR
router.post('/', clienteController.criarCliente);

module.exports = router;