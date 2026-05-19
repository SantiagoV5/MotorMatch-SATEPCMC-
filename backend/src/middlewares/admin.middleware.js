const { requireAuth } = require('./auth.middleware');

function verifyAdmin(req, res, next) {
  return requireAuth(req, res, () => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }

    return next();
  });
}

const requireAdmin = verifyAdmin;

module.exports = { verifyAdmin, requireAdmin };