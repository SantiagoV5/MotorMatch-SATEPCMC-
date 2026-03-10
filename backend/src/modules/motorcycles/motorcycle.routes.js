const { Router } = require('express');
const { getAllMotorcycles, getMotorcycleById, getBrands } = require('./motorcycle.controller');

const router = Router();

// GET /api/motorcycles/brands - Debe ir antes de /:id
router.get('/brands', getBrands);

// GET /api/motorcycles
router.get('/', getAllMotorcycles);

// GET /api/motorcycles/:id
router.get('/:id', getMotorcycleById);

module.exports = router;
