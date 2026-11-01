const db = require('../config/db');

const ingresoController = {
    obtenerReporte: (req, res) => {
        const queryHistorial = `
            SELECT 
                c.id, 
                c.fecha_hora, 
                c.estado,
                COALESCE(cl.nombre, 'Cliente General') as cliente, 
                COALESCE(b.nombre, 'Sin Asignar') as barbero, 
                COALESCE(s.nombre, 'Servicio General') as servicio, 
                COALESCE(s.precio, 0) as precio
            FROM citas c
            LEFT JOIN clientes cl ON c.id_cliente = cl.id
            LEFT JOIN barberos b ON c.id_barbero = b.id
            LEFT JOIN detalle_citas dc ON c.id = dc.id_cita
            LEFT JOIN servicios s ON dc.id_servicio = s.id
            WHERE c.estado = 'completada'
            ORDER BY c.fecha_hora DESC
        `;

        db.query(queryHistorial, (err, historialRes) => {
            if (err) {
                console.error("Error BD:", err);
                return res.status(500).json({ success: false, error: 'Error BD' });
            }

            let dia = 0; let semana = 0; let mes = 0;
            const fechaActual = new Date();
            const hoyStr = fechaActual.toISOString().split('T')[0];

            // Calcular inicio y fin de la semana actual (Lunes a Domingo)
            const primerDiaSemana = new Date(fechaActual);
            const diaSemana = fechaActual.getDay();
            const diffToMonday = fechaActual.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
            primerDiaSemana.setDate(diffToMonday);
            primerDiaSemana.setHours(0, 0, 0, 0);

            const ultimoDiaSemana = new Date(primerDiaSemana);
            ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);
            ultimoDiaSemana.setHours(23, 59, 59, 999);

            historialRes.forEach(item => {
                const precio = parseFloat(item.precio || 0);
                if (item.fecha_hora) {
                    const fObj = new Date(item.fecha_hora);
                    const fechaCitaStr = fObj.toISOString().split('T')[0];

                    // Ingresos del día actual
                    if (fechaCitaStr === hoyStr) {
                        dia += precio;
                    }
                    
                    // Ingresos del mes actual
                    if (fObj.getMonth() === fechaActual.getMonth() && fObj.getFullYear() === fechaActual.getFullYear()) {
                        mes += precio;
                    }

                    // Ingresos de la semana actual (Lunes a Domingo)
                    if (fObj >= primerDiaSemana && fObj <= ultimoDiaSemana) {
                        semana += precio;
                    }
                }
            });

            res.json({
                success: true,
                totales: { dia, semana, mes },
                historial: historialRes
            });
        });
    }
};

module.exports = ingresoController;