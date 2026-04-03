const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');

const prisma                         = require('../../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/environment');
const { sendVerificationEmail, sendWelcomeEmail } = require('../../utils/mailer');

const SALT_ROUNDS = 12;

// ── Helpers ──────────────────────────────────────────────────────────────────

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

function createError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// ── Registro ─────────────────────────────────────────────────────────────────

async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw createError('Ya existe una cuenta con ese correo electrónico', 409);
  }

  const passwordHash        = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken   = crypto.randomBytes(32).toString('hex');
  const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await prisma.user.create({
    data: { fullName: name, email, passwordHash, verificationToken, verificationExpiresAt },
    select: { id: true, fullName: true, email: true, createdAt: true },
  });

  // Construir URL de verificación y enviar email
  // El envío es no-fatal: si falla, el usuario queda registrado y puede reconectar
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;
  try {
    await sendVerificationEmail({ to: email, name, verificationUrl });
  } catch (mailErr) {
    const { logger } = require('../../utils/logger');
    logger.error(`Error enviando email de verificación a ${email}: ${mailErr.message}`);
    logger.info(`[FALLBACK] Enlace de verificación: ${verificationUrl}`);
  }

  // No emitir token JWT hasta que el email esté verificado
  return {
    user: { id: user.id, name: user.fullName, email: user.email, createdAt: user.createdAt },
  };
}

// ── Verificar email ───────────────────────────────────────────────────────────

async function verifyEmail(token) {
  if (!token) throw createError('Token de verificación requerido', 400);

  const user = await prisma.user.findUnique({ where: { verificationToken: token } });

  if (!user) {
    throw createError('Enlace de verificación inválido o ya utilizado', 400);
  }
  if (user.emailVerified) {
    throw createError('Este correo ya fue verificado', 400);
  }
  if (user.verificationExpiresAt < new Date()) {
    throw createError('El enlace de verificación ha expirado. Solicita uno nuevo.', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null, verificationExpiresAt: null },
  });

  // Enviar correo de bienvenida
  try {
    await sendWelcomeEmail({ to: user.email, name: user.fullName });
  } catch (mailErr) {
    const { logger } = require('../../utils/logger');
    logger.error(`Error enviando email de bienvenida a ${user.email}: ${mailErr.message}`);
  }

  const jwtToken = signToken(user);
  return {
    token: jwtToken,
    user: { id: user.id, name: user.fullName, email: user.email, createdAt: user.createdAt },
  };
}

// ── Login ─────────────────────────────────────────────────────────────────────

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw createError('Correo o contraseña incorrectos', 401);

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw createError('Correo o contraseña incorrectos', 401);

  if (!user.emailVerified) {
    throw createError('Debes verificar tu correo electrónico antes de iniciar sesión.', 403);
  }

  const token = signToken(user);
  return {
    token,
    user: { id: user.id, name: user.fullName, email: user.email, createdAt: user.createdAt },
  };
}

// ── Reenviar correo de verificación ────────────────────────────────────────────

async function resendVerification({ email }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createError('No existe una cuenta con ese correo electrónico', 404);
  }

  if (user.emailVerified) {
    throw createError('Tu correo ya está verificado. Puedes iniciar sesión.', 400);
  }

  // Generar nuevo token de verificación
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken, verificationExpiresAt },
  });

  // Enviar correo
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;
  try {
    await sendVerificationEmail({ to: email, name: user.fullName, verificationUrl });
  } catch (error) {
    const { logger } = require('../../utils/logger');
    logger.error(`Error al enviar correo de verificación: ${error.message}`);
  }

  return {
    message: 'Correo de verificación reenviado. Revisa tu bandeja de entrada.',
  };
}


// ── Solicitar recuperación de contraseña ──────────────────────────────────────
async function requestPasswordReset({ email }) {
  const { sendPasswordResetEmail } = require('../../utils/mailer');
  const user = await prisma.user.findUnique({ where: { email } });

  // Por seguridad, siempre responde igual (no revelar si el correo existe)
  if (!user) return { message: 'Si el correo existe, recibirás un enlace de recuperación.' };

  const resetToken     = crypto.randomBytes(32).toString('hex');
  const resetExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: resetToken, resetPasswordExpiresAt: resetExpiresAt },
  });

  const appUrl   = process.env.APP_URL || 'http://localhost:5173';
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  try {
    await sendPasswordResetEmail({ to: email, name: user.fullName, resetUrl });
  } catch (err) {
    const { logger } = require('../../utils/logger');
    logger.error(`Error enviando email de recuperación a ${email}: ${err.message}`);
    logger.info(`[FALLBACK] Enlace de recuperación: ${resetUrl}`);
  }

  return { message: 'Si el correo existe, recibirás un enlace de recuperación.' };
}

// ── Restablecer contraseña ────────────────────────────────────────────────────
async function resetPassword({ token, password }) {
  const { sendPasswordChangedEmail } = require('../../utils/mailer');

  if (!token) throw createError('Token requerido', 400);

  const user = await prisma.user.findFirst({
    where: { resetPasswordToken: token },
  });

  if (!user) throw createError('El enlace de recuperación es inválido o ya fue utilizado.', 400);

  if (user.resetPasswordExpiresAt < new Date()) {
    // Limpiar token expirado
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: null, resetPasswordExpiresAt: null },
    });
    throw createError('El enlace ha expirado. Solicita uno nuevo.', 410);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken:    null,
      resetPasswordExpiresAt: null,
    },
  });

  try {
    await sendPasswordChangedEmail({ to: user.email, name: user.fullName });
  } catch (err) {
    const { logger } = require('../../utils/logger');
    logger.error(`Error enviando aviso de cambio de contraseña: ${err.message}`);
  }

  return { message: 'Contraseña actualizada exitosamente.' };
}

module.exports = { register, verifyEmail, login, resendVerification, requestPasswordReset, resetPassword };
