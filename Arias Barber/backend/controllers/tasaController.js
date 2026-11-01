const Tasa = require('../models/tasaModel');

// Caché en memoria con TTL de 30 minutos (Corrige CT-20)
let cacheTasa = {
    valor: null,
    ultimaActualizacion: 0
};
const TTL_CACHA = 30 * 60 * 1000; // 30 minutos

const tasaController = {
    obtenerTasaBCV: async (req, res) => {
        const ahora = Date.now();

        // Si tenemos una tasa en caché reciente, la devolvemos de inmediato sin saturar la API externa
        if (cacheTasa.valor && (ahora - cacheTasa.ultimaActualizacion < TTL_CACHA)) {
            return res.json({ success: true, tasa: cacheTasa.valor, fuente: 'Caché en memoria' });
        }

        try {
            // Implementar AbortController con timeout de 4 segundos (Corrige CT-20)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (data && data.promedio) {
                const nuevaTasa = data.promedio;
                
                // Actualizar caché
                cacheTasa.valor = nuevaTasa;
                cacheTasa.ultimaActualizacion = Date.now();

                // Actualizar BD local en segundo plano
                Tasa.actualizar('VES', nuevaTasa, () => {});
                
                return res.json({ success: true, tasa: nuevaTasa, fuente: 'BCV en vivo' });
            }
        } catch (error) {
            console.warn('Aviso: Fallo o timeout conectando a DolarAPI. Usando respaldo local...');
        }

        // Sistema de respaldo local si falla la API externa
        Tasa.obtener('VES', (err, results) => {
            if (err || !results || results.length === 0) {
                return res.status(500).json({ success: false, error: 'Error crítico al obtener tasa de cambio' });
            }
            res.json({ success: true, tasa: results[0].tasa, fuente: 'Base de datos local' });
        });
    }
};

module.exports = tasaController;