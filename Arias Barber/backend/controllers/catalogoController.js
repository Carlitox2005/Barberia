const Servicio = require('../models/servicioModel');
const Barbero = require('../models/barberoModel');

const catalogoController = {
    obtenerServicios: (req, res) => {
        Servicio.obtenerTodos((err, results) => {
            if (err) return res.status(500).json({ error: 'Error del servidor' });
            res.json(results);
        });
    },
    crearServicio: (req, res) => {
        const { nombre, precio, duracion_minutos, puntos_otorgados } = req.body;
        const imagen_url = req.file ? `/assets/img/${req.file.filename}` : null;
        
        Servicio.crear(nombre, precio, duracion_minutos, puntos_otorgados, imagen_url, (err, results) => {
            if (err) return res.status(500).json({ error: 'Error del servidor' });
            res.json({ success: true });
        });
    },
    actualizarServicio: (req, res) => {
        const { nombre, precio, duracion_minutos, puntos_otorgados } = req.body;
        const imagen_url = req.file ? `/assets/img/${req.file.filename}` : null;

        Servicio.actualizar(req.params.id, nombre, precio, duracion_minutos, puntos_otorgados, imagen_url, (err, results) => {
            if (err) return res.status(500).json({ error: 'Error del servidor' });
            res.json({ success: true });
        });
    },
    eliminarServicio: (req, res) => {
        Servicio.eliminar(req.params.id, (err, results) => {
            if (err) {
                if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                    return res.status(400).json({ error: 'No se puede eliminar porque hay citas agendadas con este servicio.' });
                }
                return res.status(500).json({ error: 'Error del servidor' });
            }
            res.json({ success: true });
        });
    },
    obtenerBarberos: (req, res) => {
        Barbero.obtenerTodos((err, results) => {
            if (err) return res.status(500).json({ error: 'Error del servidor' });
            res.json(results);
        });
    },
    crearBarbero: (req, res) => {
        const { nombre, telefono, cedula, direccion } = req.body;
        const imagen_url = req.file ? `/assets/img/${req.file.filename}` : null;

        Barbero.crear(nombre, telefono, cedula, direccion, imagen_url, (err, results) => {
            if (err) return res.status(500).json({ error: 'Error del servidor' });
            res.json({ success: true });
        });
    },
    actualizarBarbero: (req, res) => {
        const { nombre, telefono, cedula, direccion } = req.body;
        const imagen_url = req.file ? `/assets/img/${req.file.filename}` : null;

        Barbero.actualizar(req.params.id, nombre, telefono, cedula, direccion, imagen_url, (err, results) => {
            if (err) return res.status(500).json({ error: 'Error del servidor' });
            res.json({ success: true });
        });
    },
    eliminarBarbero: (req, res) => {
        Barbero.eliminar(req.params.id, (err, results) => {
            if (err) {
                if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                    return res.status(400).json({ error: 'No se puede eliminar porque este barbero tiene citas agendadas.' });
                }
                return res.status(500).json({ error: 'Error del servidor' });
            }
            res.json({ success: true });
        });
    }
};

module.exports = catalogoController;