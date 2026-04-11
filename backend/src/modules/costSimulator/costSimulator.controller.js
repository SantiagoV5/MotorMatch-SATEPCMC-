const {
  calculateCostSimulation,
  saveCostSimulation,
  getUserSimulationHistory,
  getSimulationById,
  deleteSimulation,
} = require('./costSimulator.service');
const { getCalculationInfo } = require('../../utils/costCalculator');

/**
 * GET /api/cost-simulator/calculate
 * Calcula la simulación sin guardar
 */
async function calculate(req, res, next) {
  try {
    const { motorcycleId, soatCost, registrationCost, vehicleTaxCost, userId: queryUserId, monthlyIncome: queryMonthlyIncome } =
      req.query;

    // Usar userId del middleware (si está autenticado) o del parámetro query
    const userId = req.user?.id || (queryUserId ? parseInt(queryUserId) : null);
    const monthlyIncome = queryMonthlyIncome ? parseFloat(queryMonthlyIncome) : null;

    console.log('📊 [CostSimulator] monthlyIncome recibido:', queryMonthlyIncome, '→ parseado:', monthlyIncome);

    const simulation = await calculateCostSimulation({
      motorcycleId: parseInt(motorcycleId),
      userId,
      monthlyIncome,
      soatCost:
        soatCost !== undefined ? parseFloat(soatCost) : null,
      registrationCost:
        registrationCost !== undefined ? parseFloat(registrationCost) : null,
      vehicleTaxCost:
        vehicleTaxCost !== undefined ? parseFloat(vehicleTaxCost) : null,
    });

    res.json({
      success: true,
      data: simulation,
    });
  } catch (error) {
    // Manejar errores específicos del simulador
    if (error.message.includes('no encontrada') || error.message.includes('sin precio')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}


/**
 * POST /api/cost-simulator/save
 * Calcula y guarda la simulación
 */
async function save(req, res, next) {
  try {
    const { motorcycleId, soatCost, registrationCost, vehicleTaxCost } =
      req.body;

    const userId = req.user?.id || null;

    // Calcular simulación
    const simulation = await calculateCostSimulation({
      motorcycleId,
      userId,
      soatCost,
      registrationCost,
      vehicleTaxCost,
    });

    // Guardar solo si el usuario está autenticado
    if (!userId) {
      return res.json({
        success: true,
        data: simulation,
        message: 'Inicia sesión para guardar tu simulación',
      });
    }

    // Guardar en la BD
    const savedSimulation = await saveCostSimulation(simulation);

    res.status(201).json({
      success: true,
      data: savedSimulation,
      message: 'Simulación guardada exitosamente',
    });
  } catch (error) {
    // Manejar errores específicos del simulador
    if (error.message.includes('no encontrada') || error.message.includes('sin precio')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * GET /api/cost-simulator/history
 * Obtiene el historial de simulaciones del usuario
 */
async function getHistory(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Debe estar autenticado',
      });
    }

    const { limit = 10, offset = 0 } = req.query;

    const history = await getUserSimulationHistory(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/cost-simulator/:id
 * Obtiene una simulación específica
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const simulation = await getSimulationById(parseInt(id));

    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Simulación no encontrada',
      });
    }

    // Validar que el usuario sea el propietario
    if (userId && simulation.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado',
      });
    }

    res.json({
      success: true,
      data: simulation,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/cost-simulator/:id
 * Elimina una simulación
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Debe estar autenticado',
      });
    }

    await deleteSimulation(parseInt(id), userId);

    res.json({
      success: true,
      message: 'Simulación eliminada',
    });
  } catch (error) {
    if (error.message === 'No autorizado para eliminar esta simulación') {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * GET /api/cost-simulator/info
 * Obtiene información sobre cómo se calculan los valores (para tooltips)
 */
async function getCalculationInfoEndpoint(req, res, next) {
  try {
    const info = getCalculationInfo();
    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  calculate,
  save,
  getHistory,
  getById,
  remove,
  getCalculationInfoEndpoint,
};
