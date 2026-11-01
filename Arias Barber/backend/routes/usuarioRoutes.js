const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, esAdministrador } = require('../middlewares/authMiddleware');

router.get('/usuarios', verificarToken, esAdministrador, usuarioController.obtenerUsuarios);

router.put('/usuarios/:id/rol', verificarToken, esAdministrador, usuarioController.cambiarRol);

module.exports = router;