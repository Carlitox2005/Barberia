const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const configuracionController = require('../controllers/configuracionController');
const { verificarToken, esAdministrador } = require('../middlewares/authMiddleware');

// La lectura puede ser pública para la Landing Page o clientes
router.get('/', configuracionController.obtenerConfig);

// La actualización del logo y configuración global requiere rol de Administrador
router.put('/', verificarToken, esAdministrador, upload.single('imagen'), configuracionController.actualizarConfig);

module.exports = router;