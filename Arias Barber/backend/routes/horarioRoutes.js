const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verificarToken, esAdministrador, esBarberoOAdmin } = require('../middlewares/authMiddleware');

router.get('/barbero/:id_barbero', verificarToken, esBarberoOAdmin, (req, res) => {
    const idBarbero = req.params.id_barbero;
    const query = 'SELECT * FROM horarios_barberos WHERE id_barbero = ? ORDER BY id ASC';
    
    db.query(query, [idBarbero], (err, results) => {
        if (err) {
            console.error("Error obteniendo horarios:", err);
            return res.status(500).json({ success: false, error: 'Error en la base de datos' });
        }
        res.json({ success: true, data: results });
    });
});

router.post('/', verificarToken, esAdministrador, (req, res) => {
    const { id_barbero, dia_semana, hora_apertura, hora_cierre, esta_activo } = req.body;
    const query = 'INSERT INTO horarios_barberos (id_barbero, dia_semana, hora_apertura, hora_cierre, esta_activo) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [id_barbero, dia_semana, hora_apertura, hora_cierre, esta_activo || 1], (err, result) => {
        if (err) {
            console.error("Error guardando horario:", err);
            return res.status(500).json({ success: false, error: 'Error guardando en la BD' });
        }
        res.json({ success: true, mensaje: 'Turno asignado correctamente' });
    });
});

router.delete('/:id', verificarToken, esAdministrador, (req, res) => {
    const query = 'DELETE FROM horarios_barberos WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: 'Error eliminando turno' });
        res.json({ success: true, mensaje: 'Turno eliminado con éxito' });
    });
});

module.exports = router;