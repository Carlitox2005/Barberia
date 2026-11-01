const Horario = require('../models/horarioModel');

const horarioController = {
    listarPorBarbero: (req, res) => {
        Horario.obtenerPorBarbero(req.params.id_barbero, (err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al obtener los horarios del barbero' });
            res.json({ success: true, data: results });
        });
    },

    crear: (req, res) => {
        const { id_barbero, dia_semana, hora_apertura, hora_cierre, esta_activo } = req.body;
        Horario.crear(id_barbero, dia_semana, hora_apertura, hora_cierre, esta_activo, (err) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al registrar el horario en la base de datos' });
            res.json({ success: true, mensaje: 'Horario registrado exitosamente' });
        });
    },

    actualizar: (req, res) => {
        const { hora_apertura, hora_cierre, esta_activo } = req.body;
        Horario.actualizar(req.params.id, hora_apertura, hora_cierre, esta_activo, (err) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al actualizar el horario' });
            res.json({ success: true, mensaje: 'Horario actualizado exitosamente' });
        });
    },

    eliminar: (req, res) => {
        Horario.eliminar(req.params.id, (err) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al eliminar el horario' });
            res.json({ success: true, mensaje: 'Horario eliminado con éxito' });
        });
    }
};

module.exports = horarioController;