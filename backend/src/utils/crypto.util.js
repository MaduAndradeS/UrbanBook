const CryptoJS = require('crypto-js');

const SECRET_KEY =
  process.env.CRYPTO_SECRET ||
  'urbanbook_super_chave_2025';



// =========================
// CRIPTOGRAFAR (AES)
// =========================
exports.criptografar = (texto) => {

  if (!texto) return null;

  return CryptoJS.AES.encrypt(
    texto,
    SECRET_KEY
  ).toString();
};



// =========================
// DESCRIPTOGRAFAR (AES)
// =========================
exports.descriptografar = (texto) => {

  if (!texto) return null;

  const bytes =
    CryptoJS.AES.decrypt(
      texto,
      SECRET_KEY
    );

  return bytes.toString(
    CryptoJS.enc.Utf8
  );
};



// =========================
// HASH PARA BUSCA
// =========================
exports.hashValor = (texto) => {

  if (!texto) return null;

  return CryptoJS.SHA256(
    texto
      .replace(/\D/g, '') // remove pontos, traços etc
      .trim()
  ).toString();
};