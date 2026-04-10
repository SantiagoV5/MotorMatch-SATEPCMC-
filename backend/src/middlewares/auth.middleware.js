const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');

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
    req.user = { id: payload.sub, email: payload.email };
    next();
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
    req.user = { id: payload.sub, email: payload.email };
  } catch (err) {
    // Ignorar errores de token y continuar
  }

  next();
}

module.exports = { requireAuth, optionalAuth };
