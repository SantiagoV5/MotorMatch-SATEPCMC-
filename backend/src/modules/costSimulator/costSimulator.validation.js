const Joi = require('joi');

/**
 * Validación para calcular simulación
 */
const calculateSimulationSchema = Joi.object({
  motorcycleId: Joi.number().integer().required().messages({
    'number.base': 'motorcycleId debe ser un número',
    'any.required': 'motorcycleId es requerido',
  }),
  soatCost: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'soatCost debe ser un número',
    'number.min': 'soatCost no puede ser negativo',
  }),
  registrationCost: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'registrationCost debe ser un número',
    'number.min': 'registrationCost no puede ser negativo',
  }),
  vehicleTaxCost: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'vehicleTaxCost debe ser un número',
    'number.min': 'vehicleTaxCost no puede ser negativo',
  }),
  userId: Joi.number().integer().optional().messages({
    'number.base': 'userId debe ser un número',
  }),
  monthlyIncome: Joi.number().min(0).optional().messages({
    'number.base': 'monthlyIncome debe ser un número',
    'number.min': 'monthlyIncome no puede ser negativo',
  }),
});

/**
 * Validación para guardar simulación
 */
const saveCostSimulationSchema = Joi.object({
  motorcycleId: Joi.number().integer().required(),
  soatCost: Joi.number().min(0).allow(null).optional(),
  registrationCost: Joi.number().min(0).allow(null).optional(),
  vehicleTaxCost: Joi.number().min(0).allow(null).optional(),
});

module.exports = {
  calculateSimulationSchema,
  saveCostSimulationSchema,
};
