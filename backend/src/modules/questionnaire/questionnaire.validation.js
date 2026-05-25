const Joi = require('joi')

const questionnaireSchema = Joi.object({
  budget: Joi.number().min(0).allow(null).default(null).messages({
    'number.base': 'El presupuesto debe ser un número',
    'number.min': 'El presupuesto no puede ser negativo',
  }),
  includesSoat: Joi.boolean().default(false),
  includesRegistration: Joi.boolean().default(false),
  usageType: Joi.string().trim()
    .valid('ciudad', 'carretera', 'mixto', 'offroad', 'trabajo', 'deporte')
    .allow(null, '').default(null).messages({
      'any.only': 'Tipo de uso no válido',
    }),
  usageTypes: Joi.array().items(
    Joi.string().trim().valid('ciudad', 'carretera', 'mixto', 'offroad', 'trabajo', 'deporte')
  ).default([]).messages({
    'array.base': 'Los tipos de uso deben ser una lista',
    'any.only': 'Tipo de uso no válido',
  }),
  frequency: Joi.string().trim()
    .valid('diario', 'semanal', 'fines_de_semana', 'ocasional')
    .allow(null, '').default(null),
  motorcycleTypeExperience: Joi.string().trim()
    .valid('automatica', 'semiautomatica', 'manual')
    .required().messages({
      'any.only': 'Tipo de moto no válido',
      'any.required': 'El tipo de moto que sabes manejar es obligatorio',
    }),
  ridingExperienceYears: Joi.number().integer().min(0).max(60).required().messages({
    'number.base': 'La experiencia debe ser un número',
    'number.min': 'La experiencia no puede ser negativa',
    'number.max': 'La experiencia parece demasiado alta',
    'any.required': 'Los años de experiencia son obligatorios',
  }),
  heightCm: Joi.number().integer().min(140).max(220).required().messages({
    'number.base': 'La estatura debe ser un número',
    'number.min': 'La estatura mínima es 140 cm',
    'number.max': 'La estatura máxima es 220 cm',
    'any.required': 'La estatura es obligatoria',
  }),
  weightKg: Joi.number().positive().max(200).allow(null, '').empty('').default(null),
  comfortWithHeavy: Joi.boolean().allow(null).default(null),
})

module.exports = { questionnaireSchema }

