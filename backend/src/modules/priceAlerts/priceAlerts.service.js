const db = require('../../config/database'); // Prisma instance

class PriceAlertsService {
  /**
   * Obtiene la estructura resumida de la moto que se incluye en las respuestas
   */
  get motorcycleSelect() {
    return {
      id: true,
      brand: true,
      model: true,
      year: true,
      price: true,
      imageUrl: true,
    };
  }

  /**
   * Crea una nueva alerta validando la lógica de negocio
   */
  async createAlert(userId, rawData) {
    const { motorcycleId, targetPrice, notificationType } = rawData;

    // 1. Validar que la moto existe
    const motorcycle = await db.motorcycle.findUnique({
      where: { id: motorcycleId },
      select: { id: true, price: true }
    });

    if (!motorcycle) {
      const error = new Error('La moto especificada no existe.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Validar que no tenga más de 10 alertas ACTIVAS
    const activeAlertsCount = await db.priceAlert.count({
      where: {
        userId,
        status: 'ACTIVE'
      }
    });

    if (activeAlertsCount >= 10) {
      const error = new Error('Has alcanzado el límite máximo de 10 alertas activas.');
      error.statusCode = 403;
      throw error;
    }

    // 3. Validar que no exista ya una alerta duplicada (activa o pausada)
    const existingAlert = await db.priceAlert.findFirst({
      where: {
        userId,
        motorcycleId,
        status: { in: ['ACTIVE', 'PAUSED'] } // No contar eliminadas
      }
    });

    if (existingAlert) {
      const error = new Error('Ya tienes una alerta activa o pausada para esta moto.');
      error.statusCode = 409;
      throw error;
    }

    // 4. Crear la alerta
    return db.priceAlert.create({
      data: {
        userId,
        motorcycleId,
        targetPrice,
        notificationType: notificationType || 'BOTH',
      },
      include: {
        motorcycle: { select: this.motorcycleSelect }
      }
    });
  }

  /**
   * Lista las alertas de un usuario (activas y pausadas)
   */
  async getUserAlerts(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [alerts, totalCount] = await Promise.all([
      db.priceAlert.findMany({
        where: {
          userId,
          status: { not: 'DELETED' }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          motorcycle: { select: this.motorcycleSelect }
        }
      }),
      db.priceAlert.count({
        where: {
          userId,
          status: { not: 'DELETED' }
        }
      })
    ]);

    return {
      items: alerts,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Obtiene el detalle de una alerta única (Asegura ownership)
   */
  async getAlertById(userId, alertId) {
    const alert = await db.priceAlert.findUnique({
      where: { id: alertId },
      include: {
        motorcycle: { select: this.motorcycleSelect }
      }
    });

    this._ensureOwnership(alert, userId);
    return alert;
  }

  /**
   * Cambia el estado de una alerta a PAUSED
   */
  async pauseAlert(userId, alertId) {
    const alert = await this.getAlertById(userId, alertId);

    if (alert.status === 'PAUSED') {
      return alert; // Sin cambios
    }

    return db.priceAlert.update({
      where: { id: alertId },
      data: { status: 'PAUSED' },
      include: { motorcycle: { select: this.motorcycleSelect } }
    });
  }

  /**
   * Cambia el estado de una alerta a ACTIVE
   */
  async reactivateAlert(userId, alertId) {
    const alert = await this.getAlertById(userId, alertId);

    if (alert.status === 'ACTIVE') {
      return alert; // Sin cambios
    }

    // Validar límite si la estamos reactivando
    const activeCount = await db.priceAlert.count({
      where: { userId, status: 'ACTIVE' }
    });

    if (activeCount >= 10) {
      const error = new Error('Has alcanzado el límite máximo de 10 alertas activas. Pausa o elimina una antes de reactivar.');
      error.statusCode = 403;
      throw error;
    }

    return db.priceAlert.update({
      where: { id: alertId },
      data: { status: 'ACTIVE' },
      include: { motorcycle: { select: this.motorcycleSelect } }
    });
  }

  /**
   * Elimina suavemente (soft delete) una alerta
   */
  async deleteAlert(userId, alertId) {
    const alert = await this.getAlertById(userId, alertId);

    return db.priceAlert.update({
      where: { id: alertId },
      data: { status: 'DELETED' }
    });
  }

  /**
   * Obtiene el historial de notificaciones del usuario
   */
  async getNotificationHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [history, totalCount] = await Promise.all([
      db.notificationHistory.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: {
          motorcycle: { select: this.motorcycleSelect },
          alert: { select: { targetPrice: true, notificationType: true, status: true } }
        }
      }),
      db.notificationHistory.count({ where: { userId } })
    ]);

    return {
      items: history,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  // -- Utilidades Privadas --

  _ensureOwnership(alert, userId) {
    if (!alert) {
      const error = new Error('Alerta no encontrada.');
      error.statusCode = 404;
      throw error;
    }
    if (alert.userId !== userId) {
      const error = new Error('Acceso denegado: esta alerta no te pertenece.');
      error.statusCode = 403;
      throw error;
    }
    if (alert.status === 'DELETED') {
      const error = new Error('La alerta se encuentra eliminada y no puede ser modificada/consultada directamente.');
      error.statusCode = 400; // Podría ser 404 para no revelar su persistencia
      throw error;
    }
  }
}

module.exports = new PriceAlertsService();
