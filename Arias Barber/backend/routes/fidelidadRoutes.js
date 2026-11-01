const express = require('express');
const router = express.Router();
const fidelidadController = require('../controllers/fidelidadController');
const { verificarToken, esDuenioOAdmin } = require('../middlewares/authMiddleware');

// Solo el dueño de los puntos o un administrador puede consultar o canjear puntos (Evita IDOR)
router.get('/usuario/:id/puntos', verificarToken, esDuenioOAdmin, fidelidadController.consultarPuntos);
router.post('/usuario/:id/canjear', verificarToken, esDuenioOAdmin, fidelidadController.canjearPuntos);

module.exports = router;