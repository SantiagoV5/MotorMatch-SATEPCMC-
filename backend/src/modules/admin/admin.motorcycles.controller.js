const motorcycleService = require('./admin.motorcycles.service');

async function listMotorcycles(_req, res, next) {
  try {
    const data = await motorcycleService.listMotorcycles();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function getMotorcycleById(req, res, next) {
  try {
    const data = await motorcycleService.getMotorcycleById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createMotorcycle(req, res, next) {
  try {
    const data = await motorcycleService.createMotorcycle(req.body);
    res.status(201).json({ success: true, message: 'Motocicleta creada correctamente', data });
  } catch (err) {
    next(err);
  }
}

async function updateMotorcycle(req, res, next) {
  try {
    const data = await motorcycleService.updateMotorcycle(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Motocicleta actualizada correctamente', data });
  } catch (err) {
    next(err);
  }
}

async function toggleMotorcycleStatus(req, res, next) {
  try {
    const data = await motorcycleService.toggleMotorcycleStatus(req.params.id);
    res.status(200).json({ success: true, message: `Motocicleta ${data.isActive ? 'habilitada' : 'deshabilitada'} correctamente`, data });
  } catch (err) {
    next(err);
  }
}

async function deleteMotorcycle(req, res, next) {
  try {
    const result = await motorcycleService.deleteMotorcycle(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMotorcycles,
  getMotorcycleById,
  createMotorcycle,
  updateMotorcycle,
  toggleMotorcycleStatus,
  deleteMotorcycle,
};