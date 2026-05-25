const express = require('express');
const router = express.Router();

const multer = require('multer');
const storage = require('../services/cloudinary');
const upload = multer({ storage });

const prisma = require('../lib/prisma');
const clienteController = require('../controllers/cliente.controller');

router.post(
  "/esqueci-senha",
  clienteController.esqueciSenha
);


//  LISTAR + BUSCAR
router.get('/', clienteController.listarClientes);

//  BUSCAR POR ID
router.get('/:id', clienteController.buscarClientePorId);

//  CRIAR CLIENTE (COM OU SEM FOTO)
router.post('/', upload.single('foto'), clienteController.criarCliente);

router.put('/:id', clienteController.atualizarCliente);

//  ATUALIZAR FOTO DE PERFIL
router.patch('/perfil/foto', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ erro: 'ID do cliente é obrigatório' });
    }

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhuma foto enviada' });
    }

    const urlCloudinary = req.file.path;

    const cliente = await prisma.cLIENTE.update({
      where: { ID_CLIENTE: Number(id) },
      data: { FOTO_PERFIL: urlCloudinary }
    });

    return res.json(cliente);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar foto do cliente' });
  }
});

router.post("/redefinir-senha", clienteController.redefinirSenha);


module.exports = router;

