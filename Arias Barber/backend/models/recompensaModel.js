const db = require('../config/db');

const Recompensa = {
    obtenerActivas: (callback) => {
        db.query("SELECT id, nombre, puntos_requeridos, descripcion, imagen_url FROM recompensas WHERE estado = 'activo' ORDER BY puntos_requeridos ASC", callback);
    },

    obtenerCostoRecompensa: (id_recompensa, callback) => {
        db.query("SELECT puntos_requeridos FROM recompensas WHERE id = ? AND estado = 'activo'", [id_recompensa], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(null, null);
            callback(null, results[0].puntos_requeridos);
        });
    },

    crear: (nombre, puntos_requeridos, descripcion, imagen_url, callback) => {
        db.query("INSERT INTO recompensas (nombre, puntos_requeridos, descripcion, imagen_url) VALUES (?, ?, ?, ?)",
        [nombre, puntos_requeridos, descripcion, imagen_url], callback);
    },

    actualizar: (id, nombre, puntos_requeridos, descripcion, imagen_url, callback) => {
        if (imagen_url) {
            const query = "UPDATE recompensas SET nombre = ?, puntos_requeridos = ?, descripcion = ?, imagen_url = ? WHERE id = ?";
            db.query(query, [nombre, puntos_requeridos, descripcion, imagen_url, id], callback);
        } else {
            const query = "UPDATE recompensas SET nombre = ?, puntos_requeridos = ?, descripcion = ? WHERE id = ?";
            db.query(query, [nombre, puntos_requeridos, descripcion, id], callback);
        }
    },

    eliminar: (id, callback) => {
        db.query("UPDATE recompensas SET estado = 'inactivo' WHERE id = ?", [id], callback);
    },

    // Transacción ACID Segura utilizando getConnection (Corrige BK-07)
    canjear: (id_cliente, id_recompensa, puntos_costo, callback) => {
        db.getConnection((err, connection) => {
            if (err) return callback(err);

            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                const queryResta = "UPDATE clientes SET puntos_fidelidad = puntos_fidelidad - ? WHERE id = ? AND puntos_fidelidad >= ?";
                connection.query(queryResta, [puntos_costo, id_cliente, puntos_costo], (err, results) => {
                    if (err || results.affectedRows === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(new Error('Puntos insuficientes o error de validación'));
                        });
                    }

                    const queryHistorial = "INSERT INTO historial_canjes (id_cliente, id_recompensa, estado) VALUES (?, ?, 'disponible')";
                    connection.query(queryHistorial, [id_cliente, id_recompensa], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err);
                            });
                        }

                        const queryMovimiento = "INSERT INTO movimientos_puntos (id_cliente, tipo, cantidad, descripcion) VALUES (?, 'canje', ?, 'Canje de recompensa')";
                        connection.query(queryMovimiento, [id_cliente, -puntos_costo], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(err);
                                });
                            }
                             
                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        callback(err);
                                    });
                                }
                                connection.release();
                                callback(null, true);
                            });
                        });
                    });
                });
            });
        });
    },

    obtenerHistorialCliente: (id_cliente, callback) => {
        const query = `
            SELECT h.id, r.nombre, r.descripcion, r.imagen_url, h.estado, h.fecha_canje
            FROM historial_canjes h
            JOIN recompensas r ON h.id_recompensa = r.id
            WHERE h.id_cliente = ?
            ORDER BY h.fecha_canje DESC
        `;
        db.query(query, [id_cliente], callback);
    }
};

module.exports = Recompensa;