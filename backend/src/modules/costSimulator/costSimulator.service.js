const { PrismaClient } = require('@prisma/client');
const {
  calculateTotalCost,
  validateBudget,
} = require('../../utils/costCalculator');
const {
  calculateMonthlyCost,
  calculateFinancialHealth,
} = require('../../utils/financialIndicator');

const prisma = new PrismaClient();

/**
 * Calcula la simulación de costos para una motocicleta
 * @param {Object} params
 * @returns {Object} Simulación de costos
 */
async function calculateCostSimulation({
  motorcycleId,
  userId = null,
  monthlyIncome = null,
  soatCost = null,
  registrationCost = null,
  vehicleTaxCost = null,
}) {
  // Obtener datos de la motocicleta
  const motorcycle = await prisma.motorcycle.findUnique({
    where: { id: motorcycleId },
  });

  if (!motorcycle) {
    throw new Error('Motocicleta no encontrada');
  }

  if (!motorcycle.price) {
    throw new Error('La motocicleta no tiene precio definido');
  }

  // Calcular costos
  const costCalculation = calculateTotalCost({
    motorcyclePrice: motorcycle.price,
    engineCc: motorcycle.engineCc,
    soatCost,
    registrationCost,
    vehicleTaxCost,
  });

  // Validar presupuesto del usuario si existe
  let budgetValidation = {
    budgetExceeded: false,
    budgetExceededPercent: null,
    message: null,
  };
  
  // Indicador financiero
  let financialHealth = {
    healthIndicator: null,
    percentage: null,
    message: null,
    risk: 'unknown',
    color: '#94a3b8',
    monthlyCost: null,
  };

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, budgetRange: true, monthlyIncome: true },
    });
    
    if (user?.budgetRange) {
      const maxBudget = user.budgetRange.max;
      const validation = validateBudget(costCalculation.totalCost, maxBudget);
      budgetValidation = {
        budgetExceeded: validation.budgetExceeded,
        budgetExceededPercent: validation.budgetExceededPercent,
        message: validation.message,
      };
    }
    
    // Calcular indicador financiero - usar monthlyIncome del parámetro o del usuario
    const effectiveMonthlyIncome = monthlyIncome || user?.monthlyIncome;
    if (effectiveMonthlyIncome) {
      const monthlyCost = calculateMonthlyCost(
        costCalculation.motorPrice,
        costCalculation.soatCost
      );
      console.log('💰 [FinancialHealth] Cálculo:', {
        monthlyCost,
        effectiveMonthlyIncome,
        percentage: (Number(monthlyCost) / Number(effectiveMonthlyIncome) * 100).toFixed(2) + '%'
      });
      const health = calculateFinancialHealth(monthlyCost, effectiveMonthlyIncome);
      financialHealth = {
        ...health,
        monthlyCost,
      };
    }
  } else {
    console.log('⚠️ [Service] Sin userId - calculando sin validación de presupuesto');
  }

  // Preparar objeto de valores editados
  const userEditedValues = {};
  if (soatCost !== null) userEditedValues.soat = true;
  if (registrationCost !== null) userEditedValues.registration = true;
  if (vehicleTaxCost !== null) userEditedValues.vehicleTax = true;

  return {
    motorcycleId,
    userId,
    ...costCalculation,
    ...budgetValidation,
    ...financialHealth,
    userEditedValues: Object.keys(userEditedValues).length > 0 ? userEditedValues : null,
  };
}

/**
 * Guarda una simulación de costos en la BD
 * @param {Object} simulationData
 * @returns {Object} Simulación guardada
 */
async function saveCostSimulation(simulationData) {
  const simulation = await prisma.costSimulation.create({
    data: {
      motorcycleId: simulationData.motorcycleId,
      userId: simulationData.userId,
      motorPrice: simulationData.motorPrice,
      soatCost: simulationData.soatCost,
      registrationCost: simulationData.registrationCost,
      vehicleTaxCost: simulationData.vehicleTaxCost,
      managementCost: simulationData.managementCost,
      totalCost: simulationData.totalCost,
      budgetExceeded: simulationData.budgetExceeded,
      budgetExceededPercent: simulationData.budgetExceededPercent,
      userEditedValues: simulationData.userEditedValues,
    },
    include: {
      motorcycle: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          price: true,
        },
      },
    },
  });

  return simulation;
}

/**
 * Obtiene el historial de simulaciones de un usuario
 * @param {number} userId
 * @param {Object} options - { limit, offset }
 * @returns {Array} Lista de simulaciones
 */
async function getUserSimulationHistory(userId, options = {}) {
  const { limit = 10, offset = 0 } = options;

  const simulations = await prisma.costSimulation.findMany({
    where: { userId },
    include: {
      motorcycle: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          price: true,
          engineCc: true,
        },
      },
    },
    orderBy: { savedAt: 'desc' },
    take: limit,
    skip: offset,
  });

  return simulations;
}

/**
 * Obtiene una simulación específica
 * @param {number} simulationId
 * @returns {Object} Simulación
 */
async function getSimulationById(simulationId) {
  const simulation = await prisma.costSimulation.findUnique({
    where: { id: simulationId },
    include: {
      motorcycle: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          price: true,
          engineCc: true,
          advantages: true,
          disadvantages: true,
        },
      },
    },
  });

  return simulation;
}

/**
 * Elimina una simulación
 * @param {number} simulationId
 * @param {number} userId
 * @returns {boolean}
 */
async function deleteSimulation(simulationId, userId) {
  const simulation = await prisma.costSimulation.findUnique({
    where: { id: simulationId },
    select: { userId: true },
  });

  if (!simulation || simulation.userId !== userId) {
    throw new Error('No autorizado para eliminar esta simulación');
  }

  await prisma.costSimulation.delete({
    where: { id: simulationId },
  });

  return true;
}

module.exports = {
  calculateCostSimulation,
  saveCostSimulation,
  getUserSimulationHistory,
  getSimulationById,
  deleteSimulation,
};
