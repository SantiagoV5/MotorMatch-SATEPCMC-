const Joi = require('joi');

const coordinateFields = {
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
};

const dealershipQuerySchema = Joi.object({
  brand: Joi.string().trim().max(50).empty('').optional(),
  limit: Joi.number().integer().min(1).max(50).default(20),
  ...coordinateFields,
}).and('lat', 'lng');

const motorcycleDealershipQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(20),
  ...coordinateFields,
}).and('lat', 'lng');

module.exports = {
  dealershipQuerySchema,
  motorcycleDealershipQuerySchema,
};
