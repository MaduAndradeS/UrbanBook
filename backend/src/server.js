require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3333;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Servidor UrbanBook rodando na porta ${PORT}`);
});