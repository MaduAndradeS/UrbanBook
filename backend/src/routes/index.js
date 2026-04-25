const express = require('express');
const router = express.Router();
// RADAR: Imprime no terminal qualquer pedido que chegue ao servidor
router.use((req, res, next) => {
  console.log(`[RADAR] O telemóvel tentou aceder a: ${req.method} ${req.url}`);
  next();
});

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