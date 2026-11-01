const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/registro', authController.registrar);
router.post('/login', authController.login);

router.post('/recuperar-password', authController.recuperarPassword);
router.post('/restablecer-password', authController.restablecerPassword);

module.exports = router;