const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true para puerto 465, false para otros puertos
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const enviarCorreoRecuperacion = async (emailDestino, token) => {
    const enlace = `http://localhost:3000/restablecer.html?token=${token}`;

    const mailOptions = {
        from: '"Arias Barber Studio" <no-reply@ariasbarber.com>',
        to: emailDestino,
        subject: 'Recuperación de Contraseña - Arias Barber Studio',
        html: `
            <div style="background-color: #0b0f19; padding: 30px; font-family: sans-serif; color: #f8fafc; border-radius: 10px;">
                <h2 style="color: #d4af37; text-align: center;">Arias Barber Studio</h2>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${enlace}" style="background: linear-gradient(135deg, #d4af37 0%, #99782b 100%); color: #05070b; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Restablecer Contraseña</a>
                </div>
                <p style="font-size: 0.85rem; color: #94a3b8; text-align: center;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[MAIL] Correo de recuperación enviado exitosamente a: ${emailDestino}`);
        return true;
    } catch (error) {
        console.error('[MAIL ERROR] Error al enviar correo:', error);
        return false;
    }
};

module.exports = { enviarCorreoRecuperacion };