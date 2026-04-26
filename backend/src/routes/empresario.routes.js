const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = require('../services/cloudinary');
const upload = multer({ storage });
const prisma = require('../lib/prisma');

const empresarioController = require('../controllers/empresario.controller');

// --- 1. CRIAÇÃO E LISTAGEM ---
router.post('/', upload.single('foto'), empresarioController.criarEmpresario);
router.get('/', empresarioController.listarEmpresarios);
router.get('/pendentes', empresarioController.listarEmpresariosPendentes);

// --- 2. ROTAS ESPECÍFICAS ---
router.get('/:id/disponibilidade', empresarioController.buscarDisponibilidade);
router.post('/disponibilidade', empresarioController.configurarDisponibilidade);
router.patch('/:id/aprovar', empresarioController.aprovarEmpresario);
router.get('/proximos', empresarioController.listarEmpresariosProximos);
//  BUSCA GENÉRICA ---
router.get('/:id', empresarioController.buscarEmpresarioPorId);

// FOTO PERFIL 
router.patch('/perfil/foto', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ erro: 'ID do empresário é obrigatório' });
    }

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhuma foto enviada' });
    }

    const urlCloudinary = req.file.path;

    const empresario = await prisma.eMPRESARIO.update({
      where: { ID_EMPRESARIO: Number(id) },
      data: { FOTO_PERFIL: urlCloudinary }
    });

    return res.json(empresario);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar foto do empresário' });
  }
});

// FOTO TRABALHO 
router.post('/trabalhos/fotos', upload.single('foto'), async (req, res) => {
  try {
    const { id_empresario } = req.body;

    if (!id_empresario) {
      return res.status(400).json({ erro: 'ID do empresário é obrigatório' });
    }

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhuma foto enviada' });
    }

    const urlCloudinary = req.file.path;

    const novaFoto = await prisma.fOTO_TRABALHO.create({
      data: {
        URL: urlCloudinary,
        ID_EMPRESARIO: Number(id_empresario)
      }
    });

    return res.status(201).json(novaFoto);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao subir foto do trabalho' });
  }
});

module.exports = router;