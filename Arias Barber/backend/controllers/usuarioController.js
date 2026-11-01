const db = require('../config/db');

const usuarioController = {
    obtenerUsuarios: (req, res) => {
        const query = `
            SELECT u.id, u.email, 
                   CASE 
                       WHEN u.id_rol = 1 THEN 'administrador' 
                       WHEN u.id_rol = 3 THEN 'barbero'
                       ELSE 'cliente' 
                   END AS rol, 
                   u.estado, 
                   c.nombre, c.telefono, c.puntos_fidelidad, c.imagen_url 
            FROM usuarios u
            LEFT JOIN clientes c ON u.id = c.id_usuario
            ORDER BY u.id DESC
        `;
        
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error de base de datos' });
            res.json(results);
        });
    },

    // Corrige CT-17 (Respuesta prematura) y vincula id_usuario en la tabla barberos (DB-04)
    cambiarRol: (req, res) => {
        const idUsuario = parseInt(req.params.id, 10);
        const { nuevo_rol } = req.body;
        
        if (!idUsuario || !['cliente', 'barbero', 'administrador'].includes(nuevo_rol)) {
            return res.status(400).json({ success: false, error: 'Datos de rol inválidos' });
        }

        let id_rol = 2; // Cliente por defecto
        if (nuevo_rol === 'administrador') id_rol = 1;
        if (nuevo_rol === 'barbero') id_rol = 3;

        db.query('UPDATE usuarios SET id_rol = ? WHERE id = ?', [id_rol, idUsuario], (err) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al actualizar rol' });

            // Si no es barbero, respondemos de inmediato
            if (nuevo_rol !== 'barbero') {
                return res.json({ success: true, mensaje: 'Rol actualizado exitosamente' });
            }

            // Si es ascendido a barbero, aseguramos su registro en la tabla barberos antes de responder
            db.query('SELECT nombre, telefono FROM clientes WHERE id_usuario = ?', [idUsuario], (err, clientes) => {
                if (err || !clientes || clientes.length === 0) {
                    return res.json({ success: true, mensaje: 'Rol actualizado (sin datos de perfil previos)' });
                }

                const { nombre, telefono } = clientes[0];
                db.query('SELECT id, id_usuario FROM barberos WHERE id_usuario = ? OR nombre = ?', [idUsuario, nombre], (err, barbs) => {
                    if (err) return res.status(500).json({ success: false, error: 'Error verificando perfil de barbero' });

                    if (barbs.length === 0) {
                        const insertQuery = 'INSERT INTO barberos (id_usuario, nombre, telefono, cedula, direccion) VALUES (?, ?, ?, "Pendiente", "Pendiente")';
                        db.query(insertQuery, [idUsuario, nombre, telefono || 'Pendiente'], (errInsert) => {
                            if (errInsert) {
                                // Fallback por si la columna id_usuario aún no ha sido creada en la BD
                                db.query('INSERT INTO barberos (nombre, telefono, cedula, direccion) VALUES (?, ?, "Pendiente", "Pendiente")', [nombre, telefono || 'Pendiente'], () => {
                                    return res.json({ success: true, mensaje: 'Rol y perfil de barbero creados exitosamente' });
                                });
                            } else {
                                return res.json({ success: true, mensaje: 'Rol y perfil de barbero creados exitosamente' });
                            }
                        });
                    } else {
                        // Si ya existía por nombre pero no tenía id_usuario vinculado, lo vinculamos
                        if (!barbs[0].id_usuario) {
                            db.query('UPDATE barberos SET id_usuario = ? WHERE id = ?', [idUsuario, barbs[0].id], () => {});
                        }
                        return res.json({ success: true, mensaje: 'Rol actualizado exitosamente' });
                    }
                });
            });
        });
    }
};

module.exports = usuarioController;