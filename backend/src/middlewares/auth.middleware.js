const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { JWT_SECRET } = require('../config/environment');

async function getActiveUserById(userId) {
  const [user] = await prisma.$queryRaw`
    SELECT
      id,
      email,
      is_admin AS "isAdmin",
      is_active AS "isActive"
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;

  return user || null;
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado - token requerido' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getActiveUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'No autorizado - usuario no encontrado' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Tu cuenta esta deshabilitada. Contacta a un administrador.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      isAdmin: Boolean(user.isAdmin || payload.is_admin || payload.isAdmin),
    };

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Sesion expirada, vuelve a iniciar sesion' });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalido' });
    }

    return next(err);
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getActiveUserById(payload.sub);

    if (user?.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        isAdmin: Boolean(user.isAdmin || payload.is_admin || payload.isAdmin),
      };
    }
  } catch (err) {
    // La autenticacion opcional no bloquea la solicitud.
  }

  return next();
}

function requireAdmin(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'No autorizado - token requerido' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Acceso solo para administradores' });
  }

  return next();
}

module.exports = { requireAuth, optionalAuth, requireAdmin };
