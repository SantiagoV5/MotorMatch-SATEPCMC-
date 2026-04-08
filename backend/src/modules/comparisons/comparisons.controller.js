const { saveComparison } = require('./comparisons.service');

async function createComparison(req, res, next) {
  try {
    const { bikeIds } = req.body;
    if (!Array.isArray(bikeIds) || bikeIds.length < 2 || bikeIds.length > 3) {
      return res.status(400).json({ message: 'Se requieren entre 2 y 3 motos para comparar.' });
    }
    const result = await saveComparison(req.user.id, bikeIds);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { createComparison };
