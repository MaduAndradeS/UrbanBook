const express = require('express');
const router = express.Router(); 
const multer = require('multer');
const storage = require('../services/cloudinary'); 
const upload = multer({ storage });
const prisma = require('../lib/prisma'); 

const empresarioController = require('../controllers/empresario.controller');

// --- 1. ROTAS DE CRIAÇÃO E LISTAGEM GERAL ---
router.post('/', upload.single('foto'), empresarioController.criarEmpresario);
router.get('/', empresarioController.listarEmpresarios);
router.get('/pendentes', empresarioController.listarEmpresariosPendentes);

// --- 2. ROTAS ESPECÍFICAS (Devem vir ANTES das rotas com :id genérico) ---
// Se colocar o /:id em cima desta, o Express nunca chegará aqui.
// --- 2. ROTAS ESPECÍFICAS ---
router.get('/:id/disponibilidade', empresarioController.buscarDisponibilidade); 
router.post('/disponibilidade', empresarioController.configurarDisponibilidade);
router.delete('/disponibilidade/:id_dispo', empresarioController.deletarDisponibilidade);
router.patch('/:id/aprovar', empresarioController.aprovarEmpresario);

// --- 3. ROTAS DE BUSCA POR ID (Genéricas) ---
router.get('/:id', empresarioController.buscarEmpresarioPorId);

// --- 4. ATUALIZAÇÕES DE PERFIL E PORTFÓLIO ---
// 📸 ATUALIZAR FOTO DE PERFIL (COM RASTREAMENTO)
// 📸 Rota para atualizar a foto de perfil usando Express e Prisma
router.patch('/perfil/foto', (req, res, next) => {
  console.log("=========================================");
  console.log("1. O CELULAR ACHOU O SERVIDOR!");
  console.log("2. Lendo senhas do arquivo .env...");
  console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "ACHOU AS SENHAS!" : "CADÊ O .ENV???");
  console.log("=========================================");

  // Se não achar a senha, trava aqui e avisa o celular pra parar de carregar
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({ erro: "O Node.js não achou o arquivo .env. O upload foi cancelado." });
  }

  // Se achou, tenta subir a foto
  upload.single('foto')(req, res, async function (err) {
    if (err) {
      console.error("🔴 ERRO NO CLOUDINARY:", err);
      return res.status(500).json({ erro: "Erro na nuvem" });
    }

    try {
      if (!req.file) return res.status(400).json({ erro: "Foto não chegou no Express" });
      
      console.log("3. Foto subiu! URL:", req.file.path);
      
      // Salva no banco de dados do Railway
      const empresario = await prisma.eMPRESARIO.update({
        where: { ID_EMPRESARIO: Number(req.body.id) },
        data: { FOTO_PERFIL: req.file.path }
      });

      console.log("4. Salvo no banco de dados com sucesso!");
      return res.json(empresario);
    } catch (dbError) {
      console.error("🔴 Erro no banco de dados:", dbError);
      return res.status(500).json({ erro: "Erro no Prisma" });
    }
  });
});
router.post('/trabalhos/fotos', upload.single('foto'), async (req, res) => {
  try {
    const { id_empresario } = req.body;
    if (!req.file) return res.status(400).json({ erro: "Nenhuma foto enviada" });
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
    return res.status(500).json({ erro: "Erro ao subir foto do trabalho" });
  }
});

// --- Rota para salvar a URL da foto vinda do Cloudinary ---
router.patch('/perfil/salvar-url-foto', async (req, res) => {
  const { id_empresario, url_foto } = req.body;

  try {
    // Atualiza a coluna FOTO_PERFIL na tabela EMPRESARIO
    const empresario = await prisma.eMPRESARIO.update({
      where: { 
        ID_EMPRESARIO: Number(id_empresario) 
      },
      data: { 
        FOTO_PERFIL: url_foto 
      }
    });

    return res.json({ 
      mensagem: "URL salva com sucesso!", 
      empresario 
    });
  } catch (error) {
    console.error("Erro ao salvar no banco:", error);
    return res.status(500).json({ erro: "Não foi possível salvar a URL no banco de dados." });
  }
});

module.exports = router;