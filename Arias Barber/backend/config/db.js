require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'arias_barber_studio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error(' Error crítico al conectar con MySQL:', err.message);
        return;
    }
    if (connection) connection.release();
    console.log(' Conexión exitosa a la base de datos (Pool activado).');
});

module.exports = db;