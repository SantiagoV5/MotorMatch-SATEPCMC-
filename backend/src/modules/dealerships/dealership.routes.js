const { Router } = require('express');
const { validate } = require('../../middlewares/validation.middleware');
const dealershipController = require('./dealership.controller');
const {
  dealershipQuerySchema,
  motorcycleDealershipQuerySchema,
} = require('./dealership.validation');

const router = Router();

router.get(
  '/motorcycles/:motorcycleId',
  validate(motorcycleDealershipQuerySchema, 'query'),
  dealershipController.getDealershipsByMotorcycle,
);

router.get(
  '/',
  validate(dealershipQuerySchema, 'query'),
  dealershipController.getDealerships,
);

module.exports = router;
