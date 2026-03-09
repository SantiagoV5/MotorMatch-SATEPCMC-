const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const prisma             = require('../../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/environment');

const SALT_ROUNDS = 12; // factor de coste de bcrypt — balance seguridad/velocidad

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Genera un JWT firmado con el id y email del usuario */
function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

/** Error de negocio con código HTTP explícito */
function createError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// ── Registro ────────────────────────────────────────────────────────────────

async function register({ name, email, password }) {
  // Verificar si el email ya existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw createError('Ya existe una cuenta con ese correo electrónico', 409);
  }

  // Hash seguro de la contraseña
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Crear usuario en la BD — fullName mapea a full_name en PostgreSQL
  const user = await prisma.user.create({
    data: { fullName: name, email, passwordHash },
    select: { id: true, fullName: true, email: true, createdAt: true },
  });

  const token = signToken(user);

  // Normalizar fullName → name para el frontend
  return { token, user: { id: user.id, name: user.fullName, email: user.email, createdAt: user.createdAt } };
}

// ── Login ───────────────────────────────────────────────────────────────────

async function login({ email, password }) {
  // Buscar usuario — mensaje genérico para no revelar si el email existe
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createError('Correo o contraseña incorrectos', 401);
  }

  // Comparar contraseña con el hash almacenado
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw createError('Correo o contraseña incorrectos', 401);
  }

  const token = signToken(user);

  // Normalizar fullName → name y excluir el hash de la respuesta
  return {
    token,
    user: { id: user.id, name: user.fullName, email: user.email, createdAt: user.createdAt },
  };
}

module.exports = { register, login };
