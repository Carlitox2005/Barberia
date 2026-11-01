const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const upload = require('../config/multer');
const { verificarToken, esAdministrador, esDuenioOAdmin } = require('../middlewares/authMiddleware');

router.get('/:id', verificarToken, esDuenioOAdmin, perfilController.obtenerPerfil);
router.put('/:id/datos', verificarToken, esDuenioOAdmin, perfilController.actualizarDatos);
router.put('/:id/password', verificarToken, esDuenioOAdmin, perfilController.actualizarPassword);
router.post('/:id/imagen', verificarToken, esDuenioOAdmin, upload.single('imagen'), perfilController.actualizarImagen);

router.put('/:id/estado', verificarToken, esAdministrador, perfilController.cambiarEstadoUsuario);

module.exports = router;