const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');

const prisma                         = require('../../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/environment');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail } = require('../../utils/mailer');

const SALT_ROUNDS = 12;

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeAuthUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    fullName: user.fullName ?? user.full_name ?? '',
    email: user.email,
    createdAt: user.createdAt ?? user.created_at ?? null,
    isAdmin: Boolean(user.isAdmin ?? user.is_admin ?? false),
    isActive: Boolean(user.isActive ?? user.is_active ?? true),
    emailVerified: user.emailVerified ?? user.email_verified ?? false,
    passwordHash: user.passwordHash ?? user.password_hash,
  };
}

async function getAuthUserByEmail(email) {
  const [user] = await prisma.$queryRaw`
    SELECT
      id,
      full_name AS "fullName",
      email,
      password_hash AS "passwordHash",
      email_verified AS "emailVerified",
      is_admin AS "isAdmin",
      is_active AS "isActive",
      created_at AS "createdAt"
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;

  return normalizeAuthUser(user);
}

async function getAuthUserById(id) {
  const [user] = await prisma.$queryRaw`
    SELECT
      id,
      full_name AS "fullName",
      email,
      is_admin AS "isAdmin",
      is_active AS "isActive",
      created_at AS "createdAt"
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;

  return normalizeAuthUser(user);
}

function signToken(user) {
  const normalizedUser = normalizeAuthUser(user);

  return jwt.sign(
    { sub: normalizedUser.id, email: normalizedUser.email, is_admin: normalizedUser.isAdmin },
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
    user: { id: user.id, name: user.fullName, email: user.email, createdAt: user.createdAt, isAdmin: false },
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
  if (!user.isActive) {
    throw createError('Tu cuenta está deshabilitada. Contacta a un administrador.', 403);
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

  const authUser = await getAuthUserById(user.id);
  const jwtToken = signToken(authUser);
  return {
    token: jwtToken,
    user: { id: authUser.id, name: authUser.fullName, email: authUser.email, createdAt: authUser.createdAt, isAdmin: authUser.isAdmin },
  };
}

// ── Login ─────────────────────────────────────────────────────────────────────

async function login({ email, password }) {
  const user = await getAuthUserByEmail(email);
  if (!user) throw createError('Correo o contraseña incorrectos', 401);

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw createError('Correo o contraseña incorrectos', 401);

  if (!user.emailVerified) {
    throw createError('Debes verificar tu correo electrónico antes de iniciar sesión.', 403);
  }

  if (!user.isActive) {
    throw createError('Tu cuenta está deshabilitada. Contacta a un administrador.', 403);
  }

  const token = signToken(user);
  return {
    token,
    user: { id: user.id, name: user.fullName, email: user.email, createdAt: user.createdAt, isAdmin: user.isAdmin },
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
// Usa $queryRaw/$executeRaw porque el cliente Prisma generado no conoce los
// campos resetPasswordToken/resetPasswordExpiresAt (volumen Docker congelado).
async function requestPasswordReset({ email }) {
  const [user] = await prisma.$queryRaw`
    SELECT id, full_name AS "fullName", email FROM users WHERE email = ${email} LIMIT 1
  `;

  if (!user) throw createError('No existe una cuenta registrada con ese correo electrónico.', 404);

  const resetToken     = crypto.randomBytes(32).toString('hex');
  const resetExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  await prisma.$executeRaw`
    UPDATE users
    SET reset_password_token = ${resetToken},
        reset_password_expires_at = ${resetExpiresAt}
    WHERE id = ${user.id}
  `;

  const appUrl   = process.env.APP_URL || 'http://localhost:5173';
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  try {
    await sendPasswordResetEmail({ to: email, name: user.fullName, resetUrl });
  } catch (err) {
    const { logger } = require('../../utils/logger');
    logger.error(`Error enviando email de recuperación a ${email}: ${err.message}`);
    logger.info(`[FALLBACK] Enlace de recuperación: ${resetUrl}`);
  }

  return { message: 'Revisa tu correo para acceder al enlace de recuperación.' };
}

// ── Restablecer contraseña ────────────────────────────────────────────────────
async function resetPassword({ token, password }) {
  if (!token) throw createError('Token requerido', 400);

  const [user] = await prisma.$queryRaw`
    SELECT id, email, full_name AS "fullName", reset_password_expires_at AS "resetPasswordExpiresAt"
    FROM users
    WHERE reset_password_token = ${token}
    LIMIT 1
  `;

  if (!user) throw createError('El enlace de recuperación es inválido o ya fue utilizado.', 400);

  if (user.resetPasswordExpiresAt < new Date()) {
    await prisma.$executeRaw`
      UPDATE users SET reset_password_token = NULL, reset_password_expires_at = NULL WHERE id = ${user.id}
    `;
    throw createError('El enlace ha expirado. Solicita uno nuevo.', 410);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.$executeRaw`
    UPDATE users
    SET password_hash = ${passwordHash},
        reset_password_token = NULL,
        reset_password_expires_at = NULL
    WHERE id = ${user.id}
  `;

  try {
    await sendPasswordChangedEmail({ to: user.email, name: user.fullName });
  } catch (err) {
    const { logger } = require('../../utils/logger');
    logger.error(`Error enviando aviso de cambio de contraseña: ${err.message}`);
  }

  return { message: 'Contraseña actualizada exitosamente.' };
}


// ── Validar token de recuperación (para verificar al entrar a la página) ──────
async function validateResetToken({ token }) {
  if (!token) throw createError('Token requerido', 400);

  const [user] = await prisma.$queryRaw`
    SELECT id, reset_password_expires_at AS "resetPasswordExpiresAt"
    FROM users
    WHERE reset_password_token = ${token}
    LIMIT 1
  `;

  if (!user) throw createError('El enlace ya fue utilizado o no es válido.', 400);

  if (user.resetPasswordExpiresAt < new Date()) {
    await prisma.$executeRaw`
      UPDATE users SET reset_password_token = NULL, reset_password_expires_at = NULL WHERE id = ${user.id}
    `;
    throw createError('El enlace ha expirado.', 410);
  }

  return { valid: true };
}

module.exports = { register, verifyEmail, login, resendVerification, requestPasswordReset, resetPassword, validateResetToken };
