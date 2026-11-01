const db = require('../config/db');

const Tasa = {
    obtener: (moneda, callback) => {
        db.query('SELECT tasa FROM tasa_cambio WHERE moneda = ?', [moneda], callback);
    },
    actualizar: (moneda, nuevaTasa, callback) => {
        db.query(
            'INSERT INTO tasa_cambio (moneda, tasa) VALUES (?, ?) ON DUPLICATE KEY UPDATE tasa = ?', 
            [moneda, nuevaTasa, nuevaTasa], 
            callback
        );
    }
};

module.exports = Tasa;