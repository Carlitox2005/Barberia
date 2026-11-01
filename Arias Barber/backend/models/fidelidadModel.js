const db = require('../config/db');

const Fidelidad = {
    // 1. Obtener puntos actuales del cliente
    obtenerPuntosUsuario: (id_cliente, callback) => {
        db.query('SELECT puntos_fidelidad FROM clientes WHERE id = ?', [id_cliente], callback);
    },
    
    // 2. Restar puntos de forma segura validando que tenga saldo suficiente (Corrige BK-06)
    restarPuntos: (id_cliente, puntos, callback) => {
        const query = 'UPDATE clientes SET puntos_fidelidad = puntos_fidelidad - ? WHERE id = ? AND puntos_fidelidad >= ?';
        db.query(query, [puntos, id_cliente, puntos], callback);
    },

    // 3. Sumar puntos de forma segura (para acreditaciones por servicios o bonos)
    sumarPuntos: (id_cliente, puntos, callback) => {
        const query = 'UPDATE clientes SET puntos_fidelidad = puntos_fidelidad + ? WHERE id = ?';
        db.query(query, [puntos, id_cliente], callback);
    },

    // 4. Registrar en el historial el movimiento de puntos (ganados o gastados)
    registrarMovimiento: (id_cliente, tipo, cantidad, descripcion, callback) => {
        const query = 'INSERT INTO movimientos_puntos (id_cliente, tipo, cantidad, descripcion) VALUES (?, ?, ?, ?)';
        db.query(query, [id_cliente, tipo, cantidad, descripcion], callback);
    }
};

module.exports = Fidelidad;