const Joi = require('joi');

const createAlertSchema = Joi.object({
  motorcycleId: Joi.number().integer().positive().required()
    .messages({ 'any.required': 'El ID de la moto es obligatorio' }),
  targetPrice: Joi.number().positive().max(9999999999.99).required()
    .messages({
      'any.required': 'El precio objetivo es obligatorio',
      'number.positive': 'El precio debe ser mayor a 0',
      'number.max': 'El precio es demasiado alto'
    }),
  notificationType: Joi.string().valid('EMAIL', 'IN_APP', 'BOTH').optional()
    .messages({ 'any.only': 'Tipo de notificación no válido' }),
});

const updateAlertSchema = Joi.object({
  targetPrice: Joi.number().positive().max(9999999999.99).optional()
    .messages({
      'number.positive': 'El precio debe ser mayor a 0',
      'number.max': 'El precio es demasiado alto'
    }),
  notificationType: Joi.string().valid('EMAIL', 'IN_APP', 'BOTH').optional()
    .messages({ 'any.only': 'Tipo de notificación no válido' }),
}).min(1);

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

module.exports = {
  createAlertSchema,
  updateAlertSchema,
  paginationSchema
};
