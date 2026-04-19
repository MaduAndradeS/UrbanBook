const express = require('express');
const router = express.Router();

const clienteRoutes = require('./cliente.routes');
const empresarioRoutes = require('./empresario.routes');
const authRoutes = require('./auth.routes');

router.get('/', (req, res) => {
  res.send('API UrbanBook funcionando');
});

router.use('/clientes', clienteRoutes);
router.use('/empresarios', empresarioRoutes);
router.use('/auth', authRoutes);

module.exports = router;