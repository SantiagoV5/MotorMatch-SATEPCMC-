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

/**
 * Middleware que protege rutas privadas.
 * Espera el header:  Authorization: Bearer <token>
 * Si el token es válido, adjunta el payload en req.user y llama next().
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado — token requerido' });
  }

  const token = authHeader.slice(7); // quitar 'Bearer '

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    getActiveUserById(payload.sub)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ message: 'No autorizado — usuario no encontrado' });
        }

        if (!user.isActive) {
          return res.status(403).json({ message: 'Tu cuenta está deshabilitada. Contacta a un administrador.' });
        }

        req.user = { id: user.id, email: user.email, isAdmin: Boolean(user.isAdmin || payload.is_admin || payload.isAdmin) };
        return next();
      })
      .catch((error) => next(error));
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Sesión expirada, vuelve a iniciar sesión' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
}

/**
 * Middleware que permite autenticación opcional.
 * Si el usuario proporciona un token válido, se adjunta en req.user.
 * Si no hay token o es inválido, continúa sin error.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continuar sin usuario
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    getActiveUserById(payload.sub)
      .then((user) => {
        if (!user || !user.isActive) {
          return next();
        }

        req.user = { id: user.id, email: user.email, isAdmin: Boolean(user.isAdmin || payload.is_admin || payload.isAdmin) };
        return next();
      })
      .catch(() => next());
  } catch (err) {
    // Ignorar errores de token y continuar
  }

  next();
}

module.exports = { requireAuth, optionalAuth };
