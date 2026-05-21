const adminDealershipService = require('./adminDealership.service');

async function listDealerships(req, res, next) {
  try {
    const result = await adminDealershipService.listDealerships(req.query);
    res.json({
      success: true,
      count: result.items.length,
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
}

async function getDealershipById(req, res, next) {
  try {
    const dealership = await adminDealershipService.getDealershipById(req.params.id);
    res.json({ success: true, data: dealership });
  } catch (err) {
    next(err);
  }
}

async function createDealership(req, res, next) {
  try {
    const dealership = await adminDealershipService.createDealership(req.body);
    res.status(201).json({
      success: true,
      message: 'Concesionario creado correctamente.',
      data: dealership,
    });
  } catch (err) {
    next(err);
  }
}

async function updateDealership(req, res, next) {
  try {
    const dealership = await adminDealershipService.updateDealership(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Concesionario actualizado correctamente.',
      data: dealership,
    });
  } catch (err) {
    next(err);
  }
}

async function deactivateDealership(req, res, next) {
  try {
    const dealership = await adminDealershipService.deactivateDealership(req.params.id);
    res.json({
      success: true,
      message: 'Concesionario desactivado correctamente.',
      data: dealership,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listDealerships,
  getDealershipById,
  createDealership,
  updateDealership,
  deactivateDealership,
};
