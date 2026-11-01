const Fidelidad = require('../models/fidelidadModel');

const fidelidadController = {
    consultarPuntos: (req, res) => {
        Fidelidad.obtenerPuntosUsuario(req.params.id, (err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error del servidor' });
            if (results.length > 0) {
                res.json({ success: true, data: results[0] });
            } else {
                res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            }
        });
    },
    canjearPuntos: (req, res) => {
        const { puntos_a_canjear } = req.body;
        
        // Validación de seguridad para evitar números negativos o inyecciones (Hallazgo BK-06 / CT-04)
        const puntos = parseInt(puntos_a_canjear, 10);
        if (isNaN(puntos) || puntos <= 0) {
            return res.status(400).json({ success: false, error: 'Cantidad de puntos inválida.' });
        }

        Fidelidad.restarPuntos(req.params.id, puntos, (err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error del servidor' });
            if (results.affectedRows > 0) {
                res.json({ success: true, mensaje: 'Puntos actualizados correctamente' });
            } else {
                res.status(400).json({ success: false, error: 'Puntos insuficientes' });
            }
        });
    }
};

module.exports = fidelidadController;