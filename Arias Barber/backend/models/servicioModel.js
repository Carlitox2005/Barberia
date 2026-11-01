const db = require('../config/db');

const Servicio = {
    obtenerTodos: (callback) => {
        db.query('SELECT * FROM servicios', callback);
    },
    crear: (nombre, precio, duracion_minutos, puntos_otorgados, imagen_url, callback) => {
        db.query(
            'INSERT INTO servicios (nombre, precio, duracion_minutos, puntos_otorgados, imagen_url) VALUES (?, ?, ?, ?, ?)',
            [nombre, precio, duracion_minutos, puntos_otorgados, imagen_url],
            callback
        );
    },
    actualizar: (id, nombre, precio, duracion_minutos, puntos_otorgados, imagen_url, callback) => {
        if (imagen_url) {
            db.query(
                'UPDATE servicios SET nombre = ?, precio = ?, duracion_minutos = ?, puntos_otorgados = ?, imagen_url = ? WHERE id = ?',
                [nombre, precio, duracion_minutos, puntos_otorgados, imagen_url, id],
                callback
            );
        } else {
            db.query(
                'UPDATE servicios SET nombre = ?, precio = ?, duracion_minutos = ?, puntos_otorgados = ? WHERE id = ?',
                [nombre, precio, duracion_minutos, puntos_otorgados, id],
                callback
            );
        }
    },
    eliminar: (id, callback) => {
        db.query('DELETE FROM servicios WHERE id = ?', [id], callback);
    }
};

module.exports = Servicio;