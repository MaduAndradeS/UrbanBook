const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);
router.post('/esqueci-senha', authController.esqueciSenha);
router.post('/redefinir-senha', authController.redefinirSenha);

console.log(authController); // deve mostrar { login, esqueciSenha, redefinirSenha }

module.exports = router;