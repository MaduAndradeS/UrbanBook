const express = require('express');
const router = express.Router();

const clienteRoutes = require('./cliente.routes');
const empresarioRoutes = require('./empresario.routes');
const authRoutes = require('./auth.routes');
const admRoutes = require('./adm.routes');
const agendamentoRoutes = require('./agendamento.routes');
const localizacaoRoutes = require('./localizacao.routes');

// rota raiz
router.get('/', (req, res) => {
  res.send('API UrbanBook funcionando');
});

// 📌 módulos da API
router.use('/clientes', clienteRoutes);
router.use('/empresarios', empresarioRoutes);
router.use('/auth', authRoutes);
router.use('/agendamentos', agendamentoRoutes);
router.use('/adm', admRoutes);
router.use('/localizacao', localizacaoRoutes);

module.exports = router;