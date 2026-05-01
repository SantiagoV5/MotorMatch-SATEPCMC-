const Joi = require('joi')

const createSupportMessageSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede superar 80 caracteres',
    'any.required': 'El nombre es obligatorio',
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Ingresa un correo electrónico válido',
    'any.required': 'El correo es obligatorio',
  }),
  message: Joi.string().trim().min(10).max(2000).required().messages({
    'string.min': 'El mensaje debe tener al menos 10 caracteres',
    'string.max': 'El mensaje no puede superar 2000 caracteres',
    'any.required': 'El mensaje es obligatorio',
  }),
  sourcePage: Joi.string().trim().max(300).allow('', null).default(null),
})

module.exports = { createSupportMessageSchema }