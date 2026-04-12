const Joi = require('joi')

const updateUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(200).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede superar 200 caracteres',
    'any.required': 'El nombre es obligatorio',
  }),
  phone: Joi.string().trim().pattern(/^[0-9+\-\s()]{7,20}$/).allow('', null).default(null).messages({
    'string.pattern.base': 'El teléfono tiene un formato inválido',
  }),
  city: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'La ciudad debe tener al menos 2 caracteres',
    'string.max': 'La ciudad no puede superar 100 caracteres',
    'any.required': 'La ciudad es obligatoria',
  }),
  heightCm: Joi.number().integer().min(140).max(220).required().messages({
    'number.base': 'La estatura debe ser un número',
    'number.min': 'La estatura mínima es 140 cm',
    'number.max': 'La estatura máxima es 220 cm',
    'any.required': 'La estatura es obligatoria',
  }),
  preferredBrands: Joi.array().items(Joi.string().trim().min(1).max(50)).min(1).required().messages({
    'array.min': 'Selecciona al menos una marca preferida',
    'any.required': 'Las marcas preferidas son obligatorias',
  }),
})

module.exports = { updateUserSchema }