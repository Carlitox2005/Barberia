const db = require('../config/db');

const Cita = {
    // Transacción ACID + Prevención de Overbooking con SELECT FOR UPDATE (Corrige BK-04, BK-05, CT-08)
    crear: (id_cliente, id_barbero, id_servicio, fecha_hora, callback) => {
        db.getConnection((err, connection) => {
            if (err) return callback(err);

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                // 1. Obtener datos y duración del servicio
                connection.query(
                    'SELECT precio, puntos_otorgados, duracion_minutos FROM servicios WHERE id = ?',
                    [id_servicio],
                    (err, resServicio) => {
                        if (err || resServicio.length === 0) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err || new Error('Servicio no encontrado'));
                            });
                        }

                        const { precio, puntos_otorgados: puntos, duracion_minutos: duracion } = resServicio[0];

                        // 2. Bloquear y verificar que no exista solapamiento de horario para ese barbero
                        const querySolapamiento = `
                            SELECT c.id 
                            FROM citas c
                            JOIN detalle_citas dc ON c.id = dc.id_cita
                            JOIN servicios s ON dc.id_servicio = s.id
                            WHERE c.id_barbero = ? 
                              AND c.estado IN ('pendiente', 'activa')
                              AND ? < DATE_ADD(c.fecha_hora, INTERVAL s.duracion_minutos MINUTE)
                              AND DATE_ADD(?, INTERVAL ? MINUTE) > c.fecha_hora
                            FOR UPDATE
                        `;

                        connection.query(querySolapamiento, [id_barbero, fecha_hora, fecha_hora, duracion], (err, choques) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(err);
                                });
                            }

                            if (choques.length > 0) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(new Error('El horario seleccionado ya fue ocupado. Por favor elige otra hora.'));
                                });
                            }

                            // 3. Insertar cabecera de la cita
                            connection.query(
                                'INSERT INTO citas (id_cliente, id_barbero, fecha_hora) VALUES (?, ?, ?)',
                                [id_cliente, id_barbero, fecha_hora],
                                (err, resCita) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            callback(err);
                                        });
                                    }

                                    const id_cita = resCita.insertId;

                                    // 4. Insertar el detalle de la cita
                                    connection.query(
                                        'INSERT INTO detalle_citas (id_cita, id_servicio, precio_historico, puntos_historicos) VALUES (?, ?, ?, ?)',
                                        [id_cita, id_servicio, precio, puntos],
                                        (err) => {
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
                                                callback(null, id_cita);
                                            });
                                        }
                                    );
                                }
                            );
                        });
                    }
                );
            });
        });
    },

    obtenerTodas: (callback) => {
        const query = `
            SELECT c.id, c.id_cliente, c.estado, c.fecha_hora, 
                   cl.nombre AS cliente, b.nombre AS barbero, 
                   s.nombre AS servicio, dc.puntos_historicos AS puntos_otorgados
            FROM citas c
            JOIN clientes cl ON c.id_cliente = cl.id
            JOIN barberos b ON c.id_barbero = b.id
            JOIN detalle_citas dc ON c.id = dc.id_cita
            JOIN servicios s ON dc.id_servicio = s.id
            ORDER BY c.fecha_hora DESC
        `;
        db.query(query, callback);
    },

    obtenerPorCliente: (id_cliente, callback) => {
        const query = `
            SELECT c.id, c.estado, c.fecha_hora, 
                   b.nombre AS barbero, s.nombre AS servicio, dc.precio_historico
            FROM citas c
            JOIN barberos b ON c.id_barbero = b.id
            JOIN detalle_citas dc ON c.id = dc.id_cita
            JOIN servicios s ON dc.id_servicio = s.id
            WHERE c.id_cliente = ?
            ORDER BY c.fecha_hora DESC
        `;
        db.query(query, [id_cliente], callback);
    },

    cambiarEstado: (id_cita, nuevo_estado, callback) => {
        db.query('UPDATE citas SET estado = ? WHERE id = ?', [nuevo_estado, id_cita], callback);
    },

    obtenerIngresos: (callback) => {
        const query = `
            SELECT 
                SUM(CASE WHEN DATE(c.fecha_hora) = CURDATE() THEN dc.precio_historico ELSE 0 END) as dia,
                SUM(CASE WHEN YEARWEEK(c.fecha_hora, 1) = YEARWEEK(CURDATE(), 1) THEN dc.precio_historico ELSE 0 END) as semana,
                SUM(CASE WHEN MONTH(c.fecha_hora) = MONTH(CURDATE()) AND YEAR(c.fecha_hora) = YEAR(CURDATE()) THEN dc.precio_historico ELSE 0 END) as mes
            FROM citas c
            JOIN detalle_citas dc ON c.id = dc.id_cita
            WHERE c.estado = 'completada'
        `;
        db.query(query, callback);
    }
};

module.exports = Cita;