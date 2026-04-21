const express = require('express');
const router = express.Router();

const clienteRoutes = require('./cliente.routes');
const empresarioRoutes = require('./empresario.routes');
const authRoutes = require('./auth.routes');
const admRoutes = require('./adm.routes');
const agendamentoRoutes = require('./agendamento.routes'); // 1. ADICIONE ESTA LINHA

router.get('/', (req, res) => {
  res.send('API UrbanBook funcionando');
});

// 📌 Módulos da API
router.use('/clientes', clienteRoutes);
router.use('/empresarios', empresarioRoutes);
router.use('/auth', authRoutes);
router.use('/agendamentos', agendamentoRoutes); // 2. ADICIONE ESTA LINHA
router.use('/adm', admRoutes); 

module.exports = router;