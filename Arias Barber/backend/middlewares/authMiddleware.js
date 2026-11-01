const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: La variable de entorno JWT_SECRET no está definida en .env');
    process.exit(1);
}

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Token no proporcionado o formato inválido.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Sesión expirada o token inválido.' });
    }
};

const esAdministrador = (req, res, next) => {
    if (!req.user || req.user.rol !== 'administrador') {
        return res.status(403).json({ success: false, error: 'Acceso denegado. Acción exclusiva para administradores.' });
    }
    next();
};

const esBarberoOAdmin = (req, res, next) => {
    if (!req.user || (req.user.rol !== 'administrador' && req.user.rol !== 'barbero')) {
        return res.status(403).json({ success: false, error: 'Acceso denegado. Se requiere rol de barbero o administrador.' });
    }
    next();
};

const esDuenioOAdmin = (req, res, next) => {
    const idParam = parseInt(req.params.id, 10);
    const esSuPropioPerfil = req.user.id === idParam || req.user.id_cliente === idParam;
    if (req.user.rol !== 'administrador' && !esSuPropioPerfil) {
        return res.status(403).json({ success: false, error: 'No tienes permiso para modificar este perfil.' });
    }
    next();
};

module.exports = { verificarToken, esAdministrador, esBarberoOAdmin, esDuenioOAdmin };