const Cita = require('../models/citaModel');
const Fidelidad = require('../models/fidelidadModel');
const db = require('../config/db'); 

const citaController = {
    crearCita: (req, res) => {
        const { id_cliente, id_barbero, id_servicio, fecha, hora } = req.body;
        const fecha_hora = `${fecha} ${hora}`;

        Cita.crear(id_cliente, id_barbero, id_servicio, fecha_hora, (err, id_cita) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al procesar la cita en la base de datos' });
            res.json({ success: true, mensaje: 'Cita agendada exitosamente', id_cita });
        });
    },

    obtenerDisponibilidad: (req, res) => {
        const { id_barbero, fecha, id_servicio } = req.query;

        if (!id_barbero || !fecha || !id_servicio) {
            return res.status(400).json({ success: false, error: 'Faltan parámetros' });
        }

        db.query('SELECT duracion_minutos FROM servicios WHERE id = ?', [id_servicio], (err, servRes) => {
            if (err || servRes.length === 0) return res.status(500).json({ success: false, error: 'Servicio no encontrado' });
            
            const duracionServicio = servRes[0].duracion_minutos;

            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const fechaObj = new Date(fecha + 'T12:00:00'); 
            const diaSemana = dias[fechaObj.getDay()];

            db.query('SELECT hora_apertura, hora_cierre FROM horarios_barberos WHERE id_barbero = ? AND dia_semana = ? AND esta_activo = 1', [id_barbero, diaSemana], (err, horRes) => {
                if (err || horRes.length === 0) {
                    return res.json({ success: true, disponibles: [], mensaje: 'El barbero no labora este día.' });
                }

                const { hora_apertura, hora_cierre } = horRes[0];

                const queryCitas = `
                    SELECT TIME(c.fecha_hora) as hora_inicio, s.duracion_minutos
                    FROM citas c
                    JOIN detalle_citas dc ON c.id = dc.id_cita
                    JOIN servicios s ON dc.id_servicio = s.id
                    WHERE c.id_barbero = ? AND DATE(c.fecha_hora) = ? AND c.estado IN ('pendiente', 'activa')
                `;

                db.query(queryCitas, [id_barbero, fecha], (err, citasRes) => {
                    if (err) return res.status(500).json({ success: false, error: 'Error al consultar citas ocupadas' });

                    const timeToMins = (timeStr) => {
                        const [h, m] = timeStr.split(':');
                        return parseInt(h) * 60 + parseInt(m);
                    };

                    const minsToTime = (mins) => {
                        const h = Math.floor(mins / 60).toString().padStart(2, '0');
                        const m = (mins % 60).toString().padStart(2, '0');
                        return `${h}:${m}`;
                    };

                    const inicioJornada = timeToMins(hora_apertura);
                    const finJornada = timeToMins(hora_cierre);
                    
                    const citasOcupadas = citasRes.map(c => ({
                        inicio: timeToMins(c.hora_inicio),
                        fin: timeToMins(c.hora_inicio) + c.duracion_minutos
                    }));

                    let slotsDisponibles = [];
                    const intervaloDeEvaluacion = 30; 

                    for (let m = inicioJornada; m + duracionServicio <= finJornada; m += intervaloDeEvaluacion) {
                        const slotInicio = m;
                        const slotFin = m + duracionServicio;

                        let hayChoque = false;
                        for (let ocupada of citasOcupadas) {
                            if (slotInicio < ocupada.fin && slotFin > ocupada.inicio) {
                                hayChoque = true;
                                break;
                            }
                        }

                        if (!hayChoque) {
                            slotsDisponibles.push(minsToTime(slotInicio));
                        }
                    }

                    res.json({ success: true, disponibles: slotsDisponibles });
                });
            });
        });
    },

    obtenerCitas: (req, res) => {
        Cita.obtenerTodas((err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error del servidor al leer citas' });
            res.json(results);
        });
    },

    obtenerHistorialUsuario: (req, res) => {
        Cita.obtenerPorCliente(req.params.id, (err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error del servidor al leer historial' });
            res.json(results);
        });
    },

    cambiarEstado: (req, res) => {
        const id_cita = req.params.id;
        const nuevo_estado = req.body.nuevo_estado || req.body.estado || 'pendiente';
        const metodo_pago = req.body.metodo_pago || 'No especificado';
        const referencia_pago = req.body.referencia_pago || 'N/A';

        const queryVerificar = `
            SELECT c.estado, c.id_cliente, s.puntos_otorgados 
            FROM citas c
            JOIN detalle_citas dc ON c.id = dc.id_cita
            JOIN servicios s ON dc.id_servicio = s.id
            WHERE c.id = ?
        `;

        db.query(queryVerificar, [id_cita], (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).json({ success: false, error: 'Cita no encontrada o error de BD' });
            }

            const estado_anterior = results[0].estado;
            const id_cliente = results[0].id_cliente;
            const puntos_reales = results[0].puntos_otorgados; 

            if (estado_anterior === nuevo_estado) {
                return res.json({ success: true, mensaje: 'La cita ya tenía este estado.' });
            }

            let queryUpdate = '';
            let paramsUpdate = [];
            
            if (nuevo_estado === 'completada') {
                queryUpdate = 'UPDATE citas SET estado = ?, metodo_pago = ?, referencia_pago = ? WHERE id = ?';
                paramsUpdate = [nuevo_estado, metodo_pago, referencia_pago, id_cita];
            } else {
                queryUpdate = 'UPDATE citas SET estado = ? WHERE id = ?';
                paramsUpdate = [nuevo_estado, id_cita];
            }

            db.query(queryUpdate, paramsUpdate, (err) => {
                if (err) return res.status(500).json({ success: false, error: 'Error al actualizar estado en la base de datos' });

                let puntosAModificar = 0;
                
                if (nuevo_estado === 'completada' && estado_anterior !== 'completada') {
                    puntosAModificar = puntos_reales;
                } 
                else if (estado_anterior === 'completada' && nuevo_estado !== 'completada') {
                    puntosAModificar = -puntos_reales; 
                }

                if (puntosAModificar !== 0 && id_cliente) {
                    let ejecutarOperacionPuntos;
                    
                    if (puntosAModificar > 0) {
                        ejecutarOperacionPuntos = function(callback) {
                            Fidelidad.sumarPuntos(id_cliente, puntosAModificar, callback);
                        };
                    } else {
                        ejecutarOperacionPuntos = function(callback) {
                            Fidelidad.restarPuntos(id_cliente, Math.abs(puntosAModificar), callback);
                        };
                    }

                    ejecutarOperacionPuntos((err) => {
                        if (err) return res.status(500).json({ success: false, error: 'Error al actualizar la billetera de puntos' });
                        
                        const tipoMov = puntosAModificar > 0 ? 'acumulacion' : 'ajuste_admin';
                        const descMov = puntosAModificar > 0 ? 'Puntos ganados por servicio completado' : 'Reversión de puntos por modificación de estado';

                        Fidelidad.registrarMovimiento(id_cliente, tipoMov, Math.abs(puntosAModificar), descMov, () => {
                            res.json({ success: true, mensaje: 'Estado y caja actualizados correctamente' });
                        });
                    });
                } else {
                    res.json({ success: true, mensaje: 'Estado actualizado correctamente' });
                }
            });
        });
    },

    obtenerReporteIngresos: (req, res) => {
        Cita.obtenerIngresos((err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al calcular los reportes financieros' });
            
            const reporte = {
                dia: results[0].dia || 0,
                semana: results[0].semana || 0,
                mes: results[0].mes || 0
            };
            res.json(reporte);
        });
    }
};

module.exports = citaController;