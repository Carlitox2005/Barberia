const db = require('../config/db');

const Usuario = {
    // Transacción ACID para evitar usuarios huérfanos sin perfil de cliente (Corrige Hallazgo #15 / CT-16)
    crear: (nombre, telefono, email, password_hash, callback) => {
        db.getConnection((err, connection) => {
            if (err) return callback(err);

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                const queryUsuario = 'INSERT INTO usuarios (email, password_hash, id_rol) VALUES (?, ?, 2)';
                connection.query(queryUsuario, [email, password_hash], (err, resUsuario) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err);
                        });
                    }

                    const id_usuario = resUsuario.insertId;
                    const queryCliente = 'INSERT INTO clientes (id_usuario, nombre, telefono) VALUES (?, ?, ?)';

                    connection.query(queryCliente, [id_usuario, nombre, telefono], (err, resCliente) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err);
                            });
                        }

                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(err);
                                });
                            }
                            connection.release();
                            callback(null, { id_usuario, id_cliente: resCliente.insertId });
                        });
                    });
                });
            });
        });
    },

    buscarPorEmail: (email, callback) => {
        const query = `
            SELECT 
                u.id AS id_usuario, 
                u.email, 
                u.password_hash, 
                u.id_rol,
                u.estado,
                r.nombre_rol AS rol, 
                c.id AS id_cliente, 
                c.nombre, 
                c.telefono,
                c.puntos_fidelidad,
                b.id AS id_barbero
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN clientes c ON u.id = c.id_usuario
            LEFT JOIN barberos b ON u.id = b.id_usuario
            WHERE u.email = ?
            LIMIT 1
        `;
        db.query(query, [email], callback);
    },

    buscarPorId: (id, callback) => {
        const query = `
            SELECT 
                u.id AS id_usuario, u.email, u.estado, r.nombre_rol AS rol,
                c.id AS id_cliente, c.nombre, c.telefono, c.puntos_fidelidad
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN clientes c ON u.id = c.id_usuario
            WHERE u.id = ?
        `;
        db.query(query, [id], callback);
    },

    guardarResetToken: (email, token, expiracion, callback) => {
        const query = 'UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE email = ?';
        db.query(query, [token, expiracion, email], callback);
    },

    buscarPorToken: (token, callback) => {
        const query = 'SELECT id AS id_usuario, email FROM usuarios WHERE reset_token = ? AND reset_token_expires > NOW()';
        db.query(query, [token], callback);
    },

    actualizarPassword: (id_usuario, hash, callback) => {
        const query = 'UPDATE usuarios SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?';
        db.query(query, [hash, id_usuario], callback);
    },

    obtenerTodos: (callback) => {
        const query = `
            SELECT 
                u.id AS id_usuario, 
                u.email, 
                u.estado,
                r.nombre_rol AS rol, 
                c.id AS id_cliente, 
                c.nombre, 
                c.telefono, 
                c.puntos_fidelidad
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN clientes c ON u.id = c.id_usuario
            ORDER BY r.nombre_rol ASC, c.nombre ASC
        `;
        db.query(query, callback);
    },

    obtenerPuntos: (id_cliente, callback) => {
        const query = 'SELECT puntos_fidelidad FROM clientes WHERE id = ?';
        db.query(query, [id_cliente], callback);
    }
};

module.exports = Usuario;