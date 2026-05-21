const Joi = require('joi');

const urlSchema = Joi.string().trim().uri({ scheme: ['http', 'https'] }).empty('').allow(null);
const phoneSchema = Joi.string().trim().pattern(/^[0-9+\-\s()]{7,30}$/).empty('').allow(null);

const motorcycleLinkSchema = Joi.object({
  motorcycleId: Joi.number().integer().positive().required(),
  isAvailable: Joi.boolean().default(true),
  notes: Joi.string().trim().max(300).empty('').allow(null),
});

const dealershipFields = {
  name: Joi.string().trim().min(2).max(160),
  address: Joi.string().trim().min(5).max(255),
  city: Joi.string().trim().max(100).empty('').allow(null),
  department: Joi.string().trim().max(100).empty('').allow(null),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  phone: phoneSchema,
  whatsapp: phoneSchema,
  website: urlSchema,
  mapsUrl: urlSchema,
  isOfficial: Joi.boolean(),
  isFeatured: Joi.boolean(),
  priority: Joi.number().integer().min(0).max(9999),
  isActive: Joi.boolean(),
  brands: Joi.array().items(Joi.string().trim().min(1).max(50)).min(1),
  motorcycles: Joi.array().items(motorcycleLinkSchema).default([]),
};

const createDealershipSchema = Joi.object({
  ...dealershipFields,
  name: dealershipFields.name.required(),
  address: dealershipFields.address.required(),
  latitude: dealershipFields.latitude.required(),
  longitude: dealershipFields.longitude.required(),
  brands: dealershipFields.brands.required(),
});

const updateDealershipSchema = Joi.object(dealershipFields).min(1);

const listDealershipsSchema = Joi.object({
  search: Joi.string().trim().max(100).empty('').optional(),
  brand: Joi.string().trim().max(50).empty('').optional(),
  status: Joi.string().valid('active', 'inactive', 'all').default('active'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = {
  createDealershipSchema,
  updateDealershipSchema,
  listDealershipsSchema,
};
