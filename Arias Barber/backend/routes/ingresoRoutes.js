const express = require('express');
const router = express.Router();
const ingresoController = require('../controllers/ingresoController');
const { verificarToken, esAdministrador } = require('../middlewares/authMiddleware');

// Ver los ingresos de la barbería es exclusivo de Gerencia (Admin)
router.get('/', verificarToken, esAdministrador, ingresoController.obtenerReporte);

module.exports = router;