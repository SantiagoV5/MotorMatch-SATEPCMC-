const dealershipService = require('./dealership.service');

async function getDealerships(req, res, next) {
  try {
    const result = await dealershipService.getDealerships(req.query);

    res.status(200).json({
      success: true,
      count: result.items.length,
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
}

async function getDealershipsByMotorcycle(req, res, next) {
  try {
    const result = await dealershipService.getDealershipsByMotorcycle(
      req.params.motorcycleId,
      req.query,
    );

    res.status(200).json({
      success: true,
      count: result.items.length,
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDealerships,
  getDealershipsByMotorcycle,
};
