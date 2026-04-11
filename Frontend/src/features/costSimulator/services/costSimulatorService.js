import apiClient from '../../../services/apiClient';

/**
 * Obtiene información sobre cómo se calculan los costos (para tooltips)
 */
export const getCalculationInfo = async () => {
  try {
    const response = await apiClient.get('/cost-simulator/info');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener información de cálculos:', error);
    throw error;
  }
};

/**
 * Calcula la simulación sin guardar
 * @param {number} motorcycleId - ID de la moto
 * @param {Object} customValues - Valores editados por el usuario {soatCost, registrationCost, vehicleTaxCost}
 * @param {number} userId - ID del usuario (opcional)
 * @param {number} monthlyIncome - Ingresos mensuales (opcional)
 */
export const calculateCostSimulation = async (motorcycleId, customValues = {}, userId = null, monthlyIncome = null) => {
  try {
    const params = {
      motorcycleId,
      ...customValues,
    };
    if (userId) {
      params.userId = userId;
    }
    if (monthlyIncome) {
      params.monthlyIncome = monthlyIncome;
    }
    const response = await apiClient.get('/cost-simulator/calculate', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error al calcular simulación:', error);
    throw error;
  }
};

/**
 * Calcula y guarda la simulación
 * @param {Object} simulationData - Datos a guardar
 */
export const saveCostSimulation = async (simulationData) => {
  try {
    const response = await apiClient.post('/cost-simulator/save', simulationData);
    return response.data.data;
  } catch (error) {
    console.error('Error al guardar simulación:', error);
    throw error;
  }
};

/**
 * Obtiene el historial de simulaciones del usuario
 * @param {Object} options - {limit, offset}
 */
export const getUserSimulationHistory = async (options = {}) => {
  try {
    const { limit = 10, offset = 0 } = options;
    const response = await apiClient.get('/cost-simulator/history', {
      params: { limit, offset },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};

/**
 * Obtiene una simulación específica
 * @param {number} simulationId
 */
export const getSimulation = async (simulationId) => {
  try {
    const response = await apiClient.get(`/cost-simulator/${simulationId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener simulación:', error);
    throw error;
  }
};

/**
 * Elimina una simulación
 * @param {number} simulationId
 */
export const deleteSimulation = async (simulationId) => {
  try {
    const response = await apiClient.delete(`/cost-simulator/${simulationId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar simulación:', error);
    throw error;
  }
};
