const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const db = require('../config/db'); 
const { verificarToken, esAdministrador, esBarberoOAdmin, esDuenioOAdmin } = require('../middlewares/authMiddleware');

const validarDisponibilidadBarbero = (req, res, next) => {
    const { id_barbero, fecha_hora, fecha } = req.body; 
    const fechaRecibida = fecha_hora || fecha;

    if (!id_barbero || !fechaRecibida) return next(); 

    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const soloFecha = fechaRecibida.split('T')[0].split(' ')[0];
    const [year, month, day] = soloFecha.split('-');
    
    const fechaObj = new Date(year, month - 1, day); 
    const diaElegido = diasSemana[fechaObj.getDay()]; 

    const query = 'SELECT id_horario, hora_apertura, hora_cierre FROM horarios_barberos WHERE id_barbero = ? AND LOWER(dia_semana) = ? AND esta_activo = 1';
    db.query(query, [id_barbero, diaElegido], (err, turnos) => {
        if (err || turnos.length === 0) {
            return res.status(400).json({ success: false, error: `El barbero seleccionado no labora los días ${diaElegido}.` });
        }
        next();
    });
};

// Verificar que el barbero solo modifique citas asignadas a él (CT-06)
const verificarPropiedadCitaBarbero = (req, res, next) => {
    if (req.user.rol === 'administrador') return next();

    const idCita = parseInt(req.params.id, 10);
    const query = `
        SELECT c.id FROM citas c
        INNER JOIN barberos b ON c.id_barbero = b.id
        WHERE c.id = ? AND (b.id_usuario = ? OR b.nombre = ?)
    `;
    db.query(query, [idCita, req.user.id, req.user.nombre], (err, results) => {
        if (err || results.length === 0) {
            return res.status(403).json({ success: false, error: 'No tienes permiso para modificar una cita asignada a otro barbero.' });
        }
        next();
    });
};

// Rutas de Clientes
router.post('/citas', verificarToken, validarDisponibilidadBarbero, citaController.crearCita);
router.get('/usuario/:id/citas', verificarToken, esDuenioOAdmin, citaController.obtenerHistorialUsuario);
router.get('/disponibilidad', verificarToken, citaController.obtenerDisponibilidad);

// Nuevo Endpoint Seguro para el Barbero (Evita fugas IDOR FE-02)
router.get('/barbero/mis-citas', verificarToken, esBarberoOAdmin, (req, res) => {
    const query = `
        SELECT c.id, c.id_cliente, c.fecha_hora, c.estado, 
               u.nombre AS cliente, b.nombre AS barbero,
               GROUP_CONCAT(s.nombre SEPARATOR ', ') AS servicio,
               COALESCE(SUM(s.puntos_otorgados), 0) AS puntos_otorgados
        FROM citas c
        INNER JOIN clientes cl ON c.id_cliente = cl.id
        INNER JOIN usuarios u ON cl.id_usuario = u.id
        INNER JOIN barberos b ON c.id_barbero = b.id
        LEFT JOIN detalle_citas dc ON c.id = dc.id_cita
        LEFT JOIN servicios s ON dc.id_servicio = s.id
        WHERE (b.id_usuario = ? OR b.nombre = ?)
        GROUP BY c.id
        ORDER BY c.fecha_hora DESC
    `;
    db.query(query, [req.user.id, req.user.nombre], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: 'Error al obtener tus citas' });
        res.json(results);
    });
});

//Cambio de estado restringido a Admin o al Barbero dueño de la cita
router.put('/citas/:id/estado', verificarToken, esBarberoOAdmin, verificarPropiedadCitaBarbero, citaController.cambiarEstado);

// Rutas Exclusivas de Administración
router.get('/citas', verificarToken, esAdministrador, citaController.obtenerCitas);
router.get('/ingresos', verificarToken, esAdministrador, citaController.obtenerReporteIngresos);

module.exports = router;