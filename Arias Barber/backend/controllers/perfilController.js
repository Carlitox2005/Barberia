const db = require('../config/db');
const bcrypt = require('bcrypt');

const perfilController = {
    obtenerPerfil: (req, res) => {
        const idUsuario = req.params.id; 
        const query = `
            SELECT c.nombre, c.telefono, c.puntos_fidelidad, c.imagen_url, u.email,
            (SELECT MIN(puntos_requeridos) FROM recompensas WHERE estado = 'activo') as minimo_recompensa
            FROM clientes c
            INNER JOIN usuarios u ON c.id_usuario = u.id
            WHERE u.id = ?
        `;
        db.query(query, [idUsuario], (err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error de base de datos' });
            
            if (results.length === 0) {
                return res.json({ success: false, data: { nombre: 'Usuario Desconocido' } });
            }
            
            res.json({ success: true, data: results[0] });
        });
    },

    actualizarDatos: (req, res) => {
        const idUsuario = req.params.id; 
        const { nombre, telefono } = req.body;
        const query = 'UPDATE clientes SET nombre = ?, telefono = ? WHERE id_usuario = ?';
        db.query(query, [nombre, telefono, idUsuario], (err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true });
        });
    },

    actualizarPassword: (req, res) => {
        const idUsuario = req.params.id;
        const { password } = req.body;
        
        
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ success: false });
            const query = 'UPDATE usuarios SET password_hash = ? WHERE id = ?';
            db.query(query, [hash, idUsuario], (err) => {
                if (err) return res.status(500).json({ success: false });
                res.json({ success: true });
            });
        });
    },

    actualizarImagen: (req, res) => {
        const idUsuario = req.params.id;
        const imagen_url = `/assets/img/${req.file.filename}`; 
        const query = 'UPDATE clientes SET imagen_url = ? WHERE id_usuario = ?';
        db.query(query, [imagen_url, idUsuario], (err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true, imagen_url });
        });
    },

    cambiarEstadoUsuario: (req, res) => {
        const idUsuario = req.params.id;
        const { estado } = req.body; 

        if (!['activo', 'inhabilitado'].includes(estado)) {
            return res.status(400).json({ success: false, error: 'Estado inválido' });
        }

        const query = 'UPDATE usuarios SET estado = ? WHERE id = ?';
        db.query(query, [estado, idUsuario], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al actualizar el estado del usuario' });
            res.json({ success: true, mensaje: 'Estado actualizado correctamente' });
        });
    }
};

module.exports = perfilController;