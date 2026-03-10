const authService = require('./auth.service');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { user } = await authService.register(req.body);
    res.status(201).json({
      message: 'Cuenta creada. Revisa tu correo electrónico para confirmar tu registro.',
      user,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/verify-email?token=xxx
async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    const { token: jwtToken, user } = await authService.verifyEmail(token);
    res.status(200).json({
      message: '¡Correo verificado exitosamente! Ya puedes iniciar sesión.',
      token: jwtToken,
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

// POST /api/auth/resend-verification
async function resendVerification(req, res, next) {
  try {
    const result = await authService.resendVerification(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, verifyEmail, login, resendVerification };
