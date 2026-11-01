const db = require('../config/db');

const Configuracion = {
    obtener: (callback) => {
        db.query("SELECT * FROM configuracion WHERE id = 1", callback);
    },
    
    actualizar: (datos, callback) => {
        let query;
        let params;

        if (datos.logo_url) {
            query = `
                INSERT INTO configuracion (id, nombre_barberia, mensaje_bienvenida, tiempo_tolerancia_cita, tema, logo_url) 
                VALUES (1, ?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                nombre_barberia = VALUES(nombre_barberia), 
                mensaje_bienvenida = VALUES(mensaje_bienvenida), 
                tiempo_tolerancia_cita = VALUES(tiempo_tolerancia_cita),
                tema = VALUES(tema),
                logo_url = VALUES(logo_url)
            `;
            params = [datos.nombre_barberia, datos.mensaje_bienvenida, datos.tiempo_tolerancia_cita, datos.tema, datos.logo_url];
        } else {
            query = `
                INSERT INTO configuracion (id, nombre_barberia, mensaje_bienvenida, tiempo_tolerancia_cita, tema) 
                VALUES (1, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                nombre_barberia = VALUES(nombre_barberia), 
                mensaje_bienvenida = VALUES(mensaje_bienvenida), 
                tiempo_tolerancia_cita = VALUES(tiempo_tolerancia_cita),
                tema = VALUES(tema)
            `;
            params = [datos.nombre_barberia, datos.mensaje_bienvenida, datos.tiempo_tolerancia_cita, datos.tema];
        }
        
        db.query(query, params, callback);
    }
};

module.exports = Configuracion;