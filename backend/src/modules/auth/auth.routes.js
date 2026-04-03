const { Router } = require('express');

const { validate }                          = require('../../middlewares/validation.middleware');
const { registerSchema, loginSchema }       = require('./auth.validation');
const { register, verifyEmail, login, resendVerification, forgotPassword, resetPassword } = require('./auth.controller');

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// GET  /api/auth/verify-email?token=xxx
router.get('/verify-email', verifyEmail);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/resend-verification
router.post('/resend-verification', resendVerification);


// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

module.exports = router;
