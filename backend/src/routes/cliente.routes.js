const express = require('express');
const router = express.Router(); // Você definiu como 'router' aqui
const multer = require('multer');
const storage = require('../services/cloudinary');
const upload = multer({ storage });
const prisma = require('../lib/prisma'); // Importe o prisma para usar no patch

const clienteController = require('../controllers/cliente.controller');


// 🔎 LISTAR + BUSCAR
router.get('/', clienteController.listarClientes);

// 🎯 BUSCAR POR ID
router.get('/:id', clienteController.buscarClientePorId);

router.post('/', upload.single('foto'), clienteController.criarCliente);

// ➕ CRIAR
router.post('/', clienteController.criarCliente);

// 📸 ATUALIZAR FOTO (Corrigido para 'router')
router.patch('/perfil/foto', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.body; 
    
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhuma foto enviada" });
    }

    const urlCloudinary = req.file.path;

    const cliente = await prisma.cLIENTE.update({
      where: { ID_CLIENTE: Number(id) },
      data: { FOTO_PERFIL: urlCloudinary }
    });

    return res.json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao atualizar foto do cliente" });
  }
});

module.exports = router;