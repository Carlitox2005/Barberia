const db = require('../config/db');

const Horario = {
    obtenerPorBarbero: (id_barbero, callback) => {
        db.query("SELECT * FROM horarios_barberos WHERE id_barbero = ? ORDER BY dia_semana ASC", [id_barbero], callback);
    },

    crear: (id_barbero, dia_semana, hora_apertura, hora_cierre, esta_activo, callback) => {
        const query = "INSERT INTO horarios_barberos (id_barbero, dia_semana, hora_apertura, hora_cierre, esta_activo) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [id_barbero, dia_semana, hora_apertura, hora_cierre, esta_activo ?? 1], callback);
    },

    actualizar: (id, hora_apertura, hora_cierre, esta_activo, callback) => {
        const query = "UPDATE horarios_barberos SET hora_apertura = ?, hora_cierre = ?, esta_activo = ? WHERE id = ?";
        db.query(query, [hora_apertura, hora_cierre, esta_activo, id], callback);
    },

    eliminar: (id, callback) => {
        db.query("DELETE FROM horarios_barberos WHERE id = ?", [id], callback);
    }
};

module.exports = Horario;