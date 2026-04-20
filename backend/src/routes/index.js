const express = require('express');
const router = express.Router();

const clienteRoutes = require('./cliente.routes');
const empresarioRoutes = require('./empresario.routes');
const authRoutes = require('./auth.routes');
const admRoutes = require('./adm.routes');

router.get('/', (req, res) => {
  res.send('API UrbanBook funcionando');
});

router.use('/clientes', clienteRoutes);
router.use('/empresarios', empresarioRoutes);
router.use('/auth', authRoutes);

// ROTAS TEMPORÁRIAS DE TESTE PARA ADM
router.use('/test/adms', admRoutes);

module.exports = router;