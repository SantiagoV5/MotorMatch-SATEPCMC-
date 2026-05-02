import apiClient from '../../../services/apiClient';

export const priceAlertsService = {
  /**
   * Crea una nueva alerta de precio
   * @param {Object} data { motorcycleId: number, targetPrice: number, notificationType: string }
   */
  createAlert: async (data) => {
    try {
      const response = await apiClient.post('/price-alerts', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obtiene la lista de alertas del usuario
   */
  getAlerts: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/price-alerts', { params: { page, limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Pausar una alerta
   */
  pauseAlert: async (id) => {
    try {
      const response = await apiClient.patch(`/price-alerts/${id}/pause`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Reactivar una alerta
   */
  reactivateAlert: async (id, data = {}) => {
    try {
      const response = await apiClient.patch(`/price-alerts/${id}/reactivate`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Eliminar una alerta
   */
  deleteAlert: async (id) => {
    try {
      const response = await apiClient.delete(`/price-alerts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obtener el historial de notificaciones
   */
  getHistory: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/price-alerts/history', { params: { page, limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
