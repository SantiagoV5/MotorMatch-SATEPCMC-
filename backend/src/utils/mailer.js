const nodemailer = require('nodemailer');
const { logger } = require('./logger');

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'soportemotormatch@gmail.com';

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

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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


// ─── Envío de recuperación de contraseña ─────────────────────────────────────
async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
            <tr><td style="background:#0a2463;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;">MOTOR<span style="color:#e84855;">MATCH</span></h1>
            </td></tr>
            <tr><td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#0a2463;font-size:22px;">Hola, ${name} 👋</h2>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>MotorMatch</strong>.
                Haz clic en el botón para continuar. Este enlace expira en <strong>10 minutos</strong>.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}" style="display:inline-block;background:#0a2463;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:1px;">
                  RESTABLECER CONTRASEÑA
                </a>
              </div>
              <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;text-align:center;">
                Si no solicitaste este cambio, ignora este correo. Tu contraseña no será modificada.
              </p>
            </td></tr>
            <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                © 2026 MotorMatch · Colombia<br>
                Si el botón no funciona, copia este enlace: <a href="${resetUrl}" style="color:#0a2463;word-break:break-all;">${resetUrl}</a>
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  if (!transporter) {
    logger.info('─'.repeat(60));
    logger.info('📧  EMAIL DE RECUPERACIÓN (modo consola)');
    logger.info(`    Para: ${to}`);
    logger.info(`    Enlace: ${resetUrl}`);
    logger.info('─'.repeat(60));
    return;
  }

  await transporter.sendMail({
    from: `"MotorMatch" <${process.env.SMTP_USER}>`,
    to,
    subject: '🔑 Restablece tu contraseña en MotorMatch',
    html,
  });
  logger.info(`Email de recuperación enviado a ${to}`);
}

// ─── Aviso de contraseña cambiada ─────────────────────────────────────────────
async function sendPasswordChangedEmail({ to, name }) {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
            <tr><td style="background:#0a2463;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;">MOTOR<span style="color:#e84855;">MATCH</span></h1>
            </td></tr>
            <tr><td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#0a2463;font-size:22px;">Contraseña actualizada</h2>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                Hola <strong>${name}</strong>, te confirmamos que la contraseña de tu cuenta en <strong>MotorMatch</strong> ha sido actualizada exitosamente.
              </p>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                Si no realizaste este cambio, contacta a nuestro equipo de soporte de inmediato.
              </p>
            </td></tr>
            <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 MotorMatch · Colombia</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  if (!transporter) {
    logger.info('─'.repeat(60));
    logger.info('📧  AVISO CONTRASEÑA CAMBIADA (modo consola)');
    logger.info(`    Para: ${to}`);
    logger.info('─'.repeat(60));
    return;
  }

  await transporter.sendMail({
    from: `"MotorMatch" <${process.env.SMTP_USER}>`,
    to,
    subject: '🔒 Tu contraseña de MotorMatch ha sido actualizada',
    html,
  });
  logger.info(`Email de cambio de contraseña enviado a ${to}`);
}

// ─── Envío de soporte ───────────────────────────────────────────────────────
async function sendSupportEmail({ name, email, message, sourcePage }) {
  const transporter = createTransporter();

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const safeSourcePage = sourcePage ? escapeHtml(sourcePage) : null;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr><td align="center">
          <table width="620" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
            <tr>
              <td style="background:#0a2463;padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;">MOTOR<span style="color:#e84855;">MATCH</span></h1>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 16px;color:#0a2463;font-size:22px;">Nuevo mensaje de soporte</h2>
                <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                  Se recibió un nuevo mensaje desde la ayuda de MotorMatch.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#475569;font-size:14px;"><strong>Nombre:</strong> ${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#475569;font-size:14px;"><strong>Correo:</strong> ${safeEmail}</td>
                  </tr>
                  ${safeSourcePage ? `
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#475569;font-size:14px;"><strong>Origen:</strong> ${safeSourcePage}</td>
                  </tr>` : ''}
                </table>

                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
                  <p style="margin:0 0 10px;color:#0a2463;font-size:14px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">Mensaje</p>
                  <p style="margin:0;color:#334155;font-size:15px;line-height:1.7;">${safeMessage}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">
                  Responder a este correo te permitirá contestar directamente al usuario.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const text = [
    'Nuevo mensaje de soporte de MotorMatch',
    `Nombre: ${name}`,
    `Correo: ${email}`,
    safeSourcePage ? `Origen: ${sourcePage}` : null,
    '',
    'Mensaje:',
    message,
  ].filter(Boolean).join('\n');

  if (!transporter) {
    logger.info('─'.repeat(60));
    logger.info('📧  MENSAJE DE SOPORTE (modo consola)');
    logger.info(`    Para: ${SUPPORT_EMAIL}`);
    logger.info(`    De: ${email}`);
    if (sourcePage) logger.info(`    Origen: ${sourcePage}`);
    logger.info(`    Mensaje: ${message}`);
    logger.info('─'.repeat(60));
    return;
  }

  await transporter.sendMail({
    from: `"MotorMatch" <${process.env.SMTP_USER}>`,
    to: SUPPORT_EMAIL,
    replyTo: email,
    subject: '🛟 Ayuda MotorMatch',
    text,
    html,
  });

  logger.info(`Mensaje de soporte enviado a ${SUPPORT_EMAIL} desde ${email}`);
}

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail, sendSupportEmail };
