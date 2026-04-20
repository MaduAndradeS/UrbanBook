require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3333;

const HOST = '0.0.0.0'; // Aceita conexões de qualquer adaptador

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor UrbanBook rodando em:`);
  console.log(`👉 Local: http://localhost:${PORT}`);
  console.log(`👉 Rede: http://172.20.10.2:${PORT}`);
});