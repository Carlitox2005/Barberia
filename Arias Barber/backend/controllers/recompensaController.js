const Recompensa = require('../models/recompensaModel');
const db = require('../config/db');

const recompensaController = {
    listarActivas: (req, res) => {
        Recompensa.obtenerActivas((err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al obtener el catálogo de recompensas' });
            res.json({ success: true, data: results });
        });
    },
    
    crear: (req, res) => {
        const { nombre, puntos_requeridos, descripcion } = req.body;
        const imagen_url = req.file ? `/assets/img/${req.file.filename}` : null;

        Recompensa.crear(nombre, puntos_requeridos, descripcion, imagen_url, (err) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al registrar la recompensa en la base de datos' });
            res.json({ success: true, mensaje: 'Recompensa creada exitosamente' });
        });
    },

    actualizar: (req, res) => {
        const { nombre, puntos_requeridos, descripcion } = req.body;
        const imagen_url = req.file ? `/assets/img/${req.file.filename}` : null;

        Recompensa.actualizar(req.params.id, nombre, puntos_requeridos, descripcion, imagen_url, (err) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al actualizar la recompensa' });
            res.json({ success: true, mensaje: 'Recompensa actualizada exitosamente' });
        });
    },
    
    eliminar: (req, res) => {
        Recompensa.eliminar(req.params.id, (err) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al eliminar la recompensa' });
            res.json({ success: true, mensaje: 'Recompensa eliminada del catálogo' });
        });
    },

    procesarCanje: (req, res) => {
        // Usamos el id_cliente del token JWT autenticado por seguridad (Evita IDOR)
        const id_cliente = req.user.id_cliente;
        const { id_recompensa } = req.body;

        if (!id_cliente || !id_recompensa) {
            return res.status(400).json({ success: false, error: 'Datos de canje incompletos.' });
        }

        // Consultamos el costo REAL en la base de datos (Corrige BK-08 / CT-03)
        Recompensa.obtenerCostoRecompensa(id_recompensa, (err, costoReal) => {
            if (err || !costoReal) {
                return res.status(404).json({ success: false, error: 'La recompensa seleccionada no existe.' });
            }

            Recompensa.canjear(id_cliente, id_recompensa, costoReal, (err) => {
                if (err) return res.status(400).json({ success: false, error: err.message || 'No se pudo procesar el canje. Verifica que tengas los puntos necesarios.' });
                res.json({ success: true, mensaje: '¡Recompensa canjeada con éxito!' });
            });
        });
    },
    
    historialCliente: (req, res) => {
        const id_cliente = req.params.id_cliente || req.user.id_cliente;
        Recompensa.obtenerHistorialCliente(id_cliente, (err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al obtener tu historial de premios' });
            res.json({ success: true, data: results });
        });
    }
};

module.exports = recompensaController;