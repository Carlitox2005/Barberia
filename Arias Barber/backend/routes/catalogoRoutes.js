const express = require('express');
const router = express.Router();
const upload = require('../config/multer'); // Multer centralizado con validación MIME, UUID y límite 3MB
const catalogoController = require('../controllers/catalogoController');
const tasaController = require('../controllers/tasaController');
const { verificarToken, esAdministrador } = require('../middlewares/authMiddleware');

// Rutas protegidas (Lectura general para cualquier usuario con sesión)
router.get('/servicios', verificarToken, catalogoController.obtenerServicios);
router.get('/barberos', verificarToken, catalogoController.obtenerBarberos);
router.get('/tasa-bcv', verificarToken, tasaController.obtenerTasaBCV);

// Rutas de Alta Seguridad (Solo Administradores pueden editar el catálogo)
router.post('/servicios', verificarToken, esAdministrador, upload.single('imagen'), catalogoController.crearServicio);
router.put('/servicios/:id', verificarToken, esAdministrador, upload.single('imagen'), catalogoController.actualizarServicio);
router.delete('/servicios/:id', verificarToken, esAdministrador, catalogoController.eliminarServicio);

router.post('/barberos', verificarToken, esAdministrador, upload.single('imagen'), catalogoController.crearBarbero);
router.put('/barberos/:id', verificarToken, esAdministrador, upload.single('imagen'), catalogoController.actualizarBarbero);
router.delete('/barberos/:id', verificarToken, esAdministrador, catalogoController.eliminarBarbero);

module.exports = router;