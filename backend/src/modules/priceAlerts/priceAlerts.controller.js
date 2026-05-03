const priceAlertsService = require('./priceAlerts.service');

const createAlert = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const newAlert = await priceAlertsService.createAlert(userId, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Alerta de precio creada exitosamente.',
      data: newAlert
    });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

const getAlerts = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await priceAlertsService.getUserAlerts(userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Listado de alertas obtenido.',
      data: result.items,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
};

const getAlertById = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const alertId = parseInt(req.params.id);

    const alert = await priceAlertsService.getAlertById(userId, alertId);

    res.status(200).json({
      success: true,
      message: 'Detalle de alerta.',
      data: alert
    });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

const pauseAlert = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const alertId = parseInt(req.params.id);

    const alert = await priceAlertsService.pauseAlert(userId, alertId);

    res.status(200).json({
      success: true,
      message: 'La alerta ha sido pausada.',
      data: alert
    });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

const reactivateAlert = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const alertId = parseInt(req.params.id);

    const alert = await priceAlertsService.reactivateAlert(userId, alertId);

    res.status(200).json({
      success: true,
      message: 'La alerta ha sido reactivada.',
      data: alert
    });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const alertId = parseInt(req.params.id);

    await priceAlertsService.deleteAlert(userId, alertId);

    res.status(200).json({
      success: true,
      message: 'La alerta ha sido eliminada permanentemente.',
      data: { id: alertId, status: 'DELETED' }
    });
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await priceAlertsService.getNotificationHistory(userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Historial de notificaciones obtenido.',
      data: result.items,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getAlertById,
  pauseAlert,
  reactivateAlert,
  deleteAlert,
  getHistory
};
