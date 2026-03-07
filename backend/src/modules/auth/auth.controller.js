const authService = require('./auth.service');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { token, user } = await authService.register(req.body);
    res.status(201).json({
      message: 'Cuenta creada exitosamente',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { token, user } = await authService.login(req.body);
    res.status(200).json({
      message: 'Sesión iniciada exitosamente',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
