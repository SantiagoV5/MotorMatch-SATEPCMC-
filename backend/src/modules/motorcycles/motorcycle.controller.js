const motorcycleService = require('./motorcycle.service');

// GET /api/motorcycles
async function getAllMotorcycles(req, res, next) {
  try {
    const filters = {
      brand:    req.query.brand,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      minCc:    req.query.minCc,
      maxCc:    req.query.maxCc,
      search:   req.query.search,
      limit:    req.query.limit,
    };

    const motorcycles = await motorcycleService.getAllMotorcycles(filters);
    
    res.status(200).json({
      success: true,
      count: motorcycles.length,
      data: motorcycles,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/motorcycles/:id
async function getMotorcycleById(req, res, next) {
  try {
    const motorcycle = await motorcycleService.getMotorcycleById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: motorcycle,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/motorcycles/brands
async function getBrands(req, res, next) {
  try {
    const brands = await motorcycleService.getBrands();
    
    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllMotorcycles,
  getMotorcycleById,
  getBrands,
};
