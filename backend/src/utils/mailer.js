const nodemailer = require('nodemailer');
const { logger } = require('./logger');

// ─── Transporter ──────────────────────────────────────────────────────────────
// En desarrollo (NODE_ENV !== 'production') y sin SMTP configurado,
// se imprime el enlace directamente en la terminal para facilitar pruebas.

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    // Modo consola: no envía email, solo loguea el enlace
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 8000,  // 8 segundos para conectar
    greetingTimeout:  5000,   // 5 segundos para saludo SMTP
    socketTimeout:    10000,  // 10 segundos de inactividad
  });
}

// ─── Envío de verificación ────────────────────────────────────────────────────
async function sendVerificationEmail({ to, name, verificationUrl }) {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

            <!-- Header -->
            <tr>
              <td style="background:#0a2463;padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;">MOTOR<span style="color:#e84855;">MATCH</span></h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 16px;color:#0a2463;font-size:22px;">Hola, ${name} 👋</h2>
                <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                  Gracias por registrarte en <strong>MotorMatch</strong>. Para activar tu cuenta y empezar a explorar motos, confirma tu correo electrónico haciendo clic en el botón.
                </p>
                <div style="text-align:center;margin:32px 0;">
                  <a href="${verificationUrl}"
                    style="display:inline-block;background:#0a2463;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:1px;">
                    CONFIRMAR CORREO
                  </a>
                </div>
                <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;text-align:center;">
                  Este enlace expira en <strong>24 horas</strong>. Si no creaste esta cuenta, ignora este correo.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">
                  © 2026 MotorMatch · Colombia<br>
                  Si el botón no funciona, copia este enlace: <a href="${verificationUrl}" style="color:#0a2463;word-break:break-all;">${verificationUrl}</a>
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  if (!transporter) {
    // Modo desarrollo sin SMTP: mostrar enlace en terminal
    logger.info('─'.repeat(60));
    logger.info('📧  EMAIL DE VERIFICACIÓN (modo consola)');
    logger.info(`    Para: ${to}`);
    logger.info(`    Enlace: ${verificationUrl}`);
    logger.info('─'.repeat(60));
    return;
  }

  await transporter.sendMail({
    from: `"MotorMatch" <${process.env.SMTP_USER}>`,
    to,
    subject: '✅ Confirma tu cuenta en MotorMatch',
    html,
  });

  logger.info(`Email de verificación enviado a ${to}`);
}

// ─── Envío de correo de bienvenida ─────────────────────────────────────────────
async function sendWelcomeEmail({ to, name }) {
  const transporter = createTransporter();
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

            <!-- Header -->
            <tr>
              <td style="background:#0a2463;padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;">MOTOR<span style="color:#e84855;">MATCH</span></h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <div style="text-align:center;margin-bottom:24px;">
                  <div style="display:inline-block;background:#d1fae5;width:80px;height:80px;border-radius:50%;line-height:80px;font-size:40px;">
                    🎉
                  </div>
                </div>
                <h2 style="margin:0 0 16px;color:#0a2463;font-size:22px;text-align:center;">¡Felicidades, ${name}!</h2>
                <p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.6;text-align:center;">
                  Tu cuenta en <strong>MotorMatch</strong> ha sido creada exitosamente.
                </p>
                <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
                  Ahora puedes disfrutar de todas las funcionalidades de nuestra plataforma:
                </p>
                <ul style="margin:0 0 24px;padding:0 0 0 20px;color:#334155;font-size:15px;line-height:1.8;">
                  <li>🏍️ Recomendaciones personalizadas de motocicletas</li>
                  <li>📊 Comparación de modelos</li>
                  <li>💰 Información de precios actualizada</li>
                  <li>📝 Cuestionarios para encontrar tu moto ideal</li>
                </ul>
                <div style="text-align:center;margin:32px 0;">
                  <a href="${appUrl}" style="display:inline-block;background:#0a2463;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
                    Ir a MotorMatch
                  </a>
                </div>
                <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;text-align:center;">
                  ¡Gracias por unirte a nuestra comunidad!
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">
                  © 2026 MotorMatch · Colombia
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  if (!transporter) {
    // Modo desarrollo sin SMTP: mostrar en terminal
    logger.info('─'.repeat(60));
    logger.info('📧  EMAIL DE BIENVENIDA (modo consola)');
    logger.info(`    Para: ${to}`);
    logger.info(`    Mensaje: ¡Felicidades ${name}! Tu cuenta ha sido creada.`);
    logger.info('─'.repeat(60));
    return;
  }

  await transporter.sendMail({
    from: `"MotorMatch" <${process.env.SMTP_USER}>`,
    to,
    subject: '🎉 ¡Bienvenido a MotorMatch!',
    html,
  });

  logger.info(`Email de bienvenida enviado a ${to}`);
}

module.exports = { sendVerificationEmail, sendWelcomeEmail };
