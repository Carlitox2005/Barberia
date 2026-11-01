const Configuracion = require('../models/configuracionModel');

const configuracionController = {
    obtenerConfig: (req, res) => {
        Configuracion.obtener((err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al obtener la configuración' });
            res.json({ success: true, data: results[0] || {} });
        });
    },

    actualizarConfig: (req, res) => {
        const configData = {
            nombre_barberia: req.body.nombre_barberia,
            mensaje_bienvenida: req.body.mensaje_bienvenida,
            tiempo_tolerancia_cita: req.body.tiempo_tolerancia_cita,
            tema: req.body.tema
        };

        if (req.file) {
            configData.logo_url = `/assets/img/${req.file.filename}`;
        }

        Configuracion.actualizar(configData, (err) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al guardar la configuración' });
            res.json({ success: true, mensaje: 'Configuración actualizada exitosamente', logo_url: configData.logo_url });
        });
    }
};

module.exports = configuracionController;