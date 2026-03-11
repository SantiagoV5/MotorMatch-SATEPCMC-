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
  frequency: Joi.string().trim()
    .valid('diario', 'semanal', 'fines_de_semana', 'ocasional')
    .allow(null, '').default(null),
  hasPassenger: Joi.boolean().default(false),
  passengerFrequency: Joi.string().trim()
    .valid('siempre', 'a_veces', 'nunca')
    .allow(null, '').default(null),
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

