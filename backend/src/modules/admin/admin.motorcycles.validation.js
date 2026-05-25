const Joi = require('joi');

const optionalNumber = Joi.alternatives().try(Joi.number(), Joi.string().trim().pattern(/^[-+]?\d+(\.\d+)?$/));
const optionalInteger = Joi.alternatives().try(Joi.number().integer(), Joi.string().trim().pattern(/^[-+]?\d+$/));

const stringArray = Joi.alternatives().try(
  Joi.array().items(Joi.string().trim().allow('')).default([]),
  Joi.string().trim().allow(''),
);

const motorcycleSchema = Joi.object({
  brand: Joi.string().trim().min(1).max(50).required().messages({
    'any.required': 'La marca es obligatoria',
    'string.empty': 'La marca es obligatoria',
  }),
  model: Joi.string().trim().min(1).max(100).required().messages({
    'any.required': 'El modelo es obligatorio',
    'string.empty': 'El modelo es obligatorio',
  }),
  year: optionalInteger.allow(null, ''),
  engineCc: optionalInteger.allow(null, ''),
  engineType: Joi.string().trim().max(50).allow('', null),
  powerHp: optionalNumber.allow(null, ''),
  torqueNm: optionalNumber.allow(null, ''),
  weightKg: optionalNumber.allow(null, ''),
  seatHeightCm: optionalInteger.allow(null, ''),
  fuelType: Joi.string().trim().max(30).allow('', null),
  fuelTankLiters: optionalNumber.allow(null, ''),
  consumptionKmpl: optionalNumber.allow(null, ''),
  transmission: Joi.string().trim().max(30).allow('', null),
  frontBrakeSystem: Joi.string().trim().max(50).allow('', null),
  price: optionalNumber.required().messages({
    'any.required': 'El precio es obligatorio',
    'string.empty': 'El precio es obligatorio',
  }),
  currency: Joi.string().trim().max(10).allow('', null),
  soatEstimated: optionalNumber.allow(null, ''),
  registrationEstimated: optionalNumber.allow(null, ''),
  imageUrl: Joi.string().trim().min(1).required().messages({
    'any.required': 'La imagen es obligatoria',
    'string.empty': 'La imagen es obligatoria',
  }),
  galleryImages: stringArray,
  referencesYT: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.object(), Joi.string().trim(), Joi.valid(null)).optional(),
  description: Joi.string().trim().min(10).required().messages({
    'any.required': 'La descripción es obligatoria',
    'string.empty': 'La descripción es obligatoria',
  }),
  advantages: stringArray.required().messages({
    'any.required': 'Debes agregar al menos una ventaja',
  }),
  disadvantages: stringArray.required().messages({
    'any.required': 'Debes agregar al menos una desventaja',
  }),
  source: Joi.string().trim().max(50).allow('', null),
  externalIds: Joi.alternatives().try(Joi.object(), Joi.string().trim(), Joi.valid(null)).optional(),
  lastApiUpdate: Joi.any().optional(),
  colors: Joi.alternatives().try(Joi.array().items(Joi.string().trim()).default([]), Joi.string().trim().allow('')).optional(),
  countryOrigin: Joi.string().trim().max(100).allow('', null),
  warranty: Joi.string().trim().max(200).allow('', null),
  isActive: Joi.boolean().optional(),
});

module.exports = { motorcycleSchema };