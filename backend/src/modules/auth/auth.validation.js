const Joi = require('joi');

// ── Registro ────────────────────────────────────────────────────────────────
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede superar 80 caracteres',
    'any.required': 'El nombre es obligatorio',
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Ingresa un correo electrónico válido',
    'any.required': 'El correo es obligatorio',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'any.required': 'La contraseña es obligatoria',
  }),
});

// ── Login ───────────────────────────────────────────────────────────────────
const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Ingresa un correo electrónico válido',
    'any.required': 'El correo es obligatorio',
  }),
  password: Joi.string().required().messages({
    'any.required': 'La contraseña es obligatoria',
  }),
});

module.exports = { registerSchema, loginSchema };
