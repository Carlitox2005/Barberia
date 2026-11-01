const db = require('../config/db');

const Barbero = {
    obtenerTodos: (callback) => {
        db.query('SELECT * FROM barberos', callback);
    },
    crear: (nombre, telefono, cedula, direccion, imagen_url, callback) => {
        db.query(
            'INSERT INTO barberos (nombre, telefono, cedula, direccion, imagen_url) VALUES (?, ?, ?, ?, ?)', 
            [nombre, telefono, cedula, direccion, imagen_url], 
            callback
        );
    },
    actualizar: (id, nombre, telefono, cedula, direccion, imagen_url, callback) => {
        if (imagen_url) {
            db.query(
                'UPDATE barberos SET nombre = ?, telefono = ?, cedula = ?, direccion = ?, imagen_url = ? WHERE id = ?',
                [nombre, telefono, cedula, direccion, imagen_url, id], callback
            );
        } else {
            db.query(
                'UPDATE barberos SET nombre = ?, telefono = ?, cedula = ?, direccion = ? WHERE id = ?',
                [nombre, telefono, cedula, direccion, id], callback
            );
        }
    },
    eliminar: (id, callback) => {
        db.query('DELETE FROM barberos WHERE id = ?', [id], callback);
    }
};

module.exports = Barbero;