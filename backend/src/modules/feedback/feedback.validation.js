const Joi = require('joi')

const createFeedbackSchema = Joi.object({
  questionnaireId: Joi.number().integer().positive().required().messages({
    'number.base': 'questionnaireId debe ser un número',
    'any.required': 'questionnaireId es obligatorio',
  }),
  isUseful: Joi.boolean().required().messages({
    'any.required': 'La valoración es obligatoria',
  }),
  improvement: Joi.string().trim().max(200).allow('', null).default(null).messages({
    'string.max': 'El comentario no puede superar 200 caracteres',
  }),
})

const feedbackQuerySchema = Joi.object({
  questionnaireId: Joi.number().integer().positive().required(),
})

module.exports = { createFeedbackSchema, feedbackQuerySchema }