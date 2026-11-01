const express = require('express');
const router = express.Router();
const recompensaController = require('../controllers/recompensaController');
const upload = require('../config/multer'); 
const { verificarToken, esAdministrador } = require('../middlewares/authMiddleware');

// Rutas de lectura y canje para usuarios autenticados
router.get('/', verificarToken, recompensaController.listarActivas);
router.post('/canjear', verificarToken, recompensaController.procesarCanje);
router.get('/historial/:id_cliente', verificarToken, recompensaController.historialCliente);

// ABM de Recompensas exclusivo de Administradores
router.post('/', verificarToken, esAdministrador, upload.single('imagen'), recompensaController.crear);
router.put('/:id', verificarToken, esAdministrador, upload.single('imagen'), recompensaController.actualizar);
router.delete('/:id', verificarToken, esAdministrador, recompensaController.eliminar);

module.exports = router;