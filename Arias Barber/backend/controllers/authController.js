const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuario = require('../models/usuarioModel');
const { enviarCorreoRecuperacion } = require('../config/mailer');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authController = {
    registrar: async (req, res) => {
        const { nombre, telefono, email, password } = req.body;

        if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
            return res.status(400).json({ success: false, error: 'Nombre inválido.' });
        }
        if (!email || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({ success: false, error: 'Correo electrónico inválido.' });
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        try {
            Usuario.buscarPorEmail(email.trim().toLowerCase(), async (err, results) => {
                if (err) return res.status(500).json({ success: false, error: 'Error en la base de datos' });
                if (results.length > 0) {
                    return res.status(400).json({ success: false, error: 'No se pudo completar el registro con los datos proporcionados.' });
                }

                const hash = await bcrypt.hash(password, 10);
                Usuario.crear(nombre.trim(), telefono, email.trim().toLowerCase(), hash, (err, ids) => {
                    if (err) return res.status(500).json({ success: false, error: 'Error al registrar usuario' });
                    res.json({ success: true, data: ids, mensaje: 'Usuario registrado exitosamente' });
                });
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error en el servidor' });
        }
    },

    login: (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Credenciales inválidas' });
        }

        Usuario.buscarPorEmail(email.trim().toLowerCase(), async (err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error en la base de datos' });
            if (results.length === 0) return res.status(401).json({ success: false, error: 'Credenciales inválidas' });

            const usuario = results[0];
            if (usuario.estado === 'inhabilitado') {
                return res.status(403).json({ success: false, error: 'Esta cuenta se encuentra inhabilitada.' });
            }

            const match = await bcrypt.compare(password, usuario.password_hash);
            if (!match) return res.status(401).json({ success: false, error: 'Credenciales inválidas' });

            const rolDb = usuario.id_rol !== undefined ? usuario.id_rol : usuario.rol;
            let rolAsignado = 'cliente';
            if (rolDb === 1 || rolDb === 'administrador') rolAsignado = 'administrador';
            else if (rolDb === 3 || rolDb === 'barbero') rolAsignado = 'barbero';

            const token = jwt.sign(
                { 
                    id: usuario.id_usuario, 
                    id_cliente: usuario.id_cliente,
                    id_barbero: usuario.id_barbero || null,
                    nombre: usuario.nombre,
                    rol: rolAsignado 
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h', algorithm: 'HS256' }
            );

            res.json({ 
                success: true, 
                token, 
                usuario: { 
                    id: usuario.id_usuario,
                    id_cliente: usuario.id_cliente,
                    nombre: usuario.nombre, 
                    email: usuario.email, 
                    rol: rolAsignado,
                    puntos_fidelidad: usuario.puntos_fidelidad 
                } 
            });
        });
    },

    recuperarPassword: (req, res) => {
        const { email } = req.body;
        if (!email || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({ success: false, error: 'Formato de correo inválido' });
        }
        
        Usuario.buscarPorEmail(email.trim().toLowerCase(), (err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error del servidor' });
            
            // Respuesta genérica para evitar enumeración de usuarios (CT-12)
            if (results.length === 0) {
                return res.json({ success: true, mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
            }

            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expiracion = new Date(Date.now() + 3600000); 

            Usuario.guardarResetToken(email.trim().toLowerCase(), tokenHash, expiracion, async (err) => {
            if (err) return res.status(500).json({ success: false, error: 'Error al procesar la solicitud' });

                 await enviarCorreoRecuperacion(email.trim().toLowerCase(), rawToken);

             res.json({ success: true, mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
            });
        });
    },

    restablecerPassword: (req, res) => {
        const { token, nuevaPassword } = req.body;
        if (!token || !nuevaPassword || nuevaPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'Datos inválidos o contraseña muy corta.' });
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        
        Usuario.buscarPorToken(tokenHash, async (err, results) => {
            if (err) return res.status(500).json({ success: false, error: 'Error del servidor' });
            if (results.length === 0) return res.status(400).json({ success: false, error: 'El enlace es inválido o ha expirado.' });

            const usuarioId = results[0].id_usuario; 
            const hash = await bcrypt.hash(nuevaPassword, 10);

            Usuario.actualizarPassword(usuarioId, hash, (err) => {
                if (err) return res.status(500).json({ success: false, error: 'Error al actualizar contraseña' });
                res.json({ success: true, mensaje: 'Contraseña actualizada correctamente' });
            });
        });
    }
};

module.exports = authController;