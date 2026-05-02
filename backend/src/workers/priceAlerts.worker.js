const cron = require('node-cron');
const db = require('../config/database');
const { sendPriceAlertEmail } = require('../utils/mailer');
const { logger } = require('../utils/logger');

// Configuración de frecuencia mediante variables de entorno (por defecto 0 8 * * * -> 8am todos los días)
const CRON_SCHEDULE = process.env.PRICE_ALERT_CRON || '0 8 * * *';
const COOLDOWN_HOURS = 48; // No re-notificar antes de 48 horas

class PriceAlertsWorker {
  constructor() {
    this.isRunning = false;
  }

  init() {
    logger.info(`[PriceAlertsWorker] Iniciando planificador de alertas con cron: ${CRON_SCHEDULE}`);
    
    cron.schedule(CRON_SCHEDULE, async () => {
      await this.processActiveAlerts();
    });
  }

  async processActiveAlerts() {
    if (this.isRunning) {
      logger.warn('[PriceAlertsWorker] Una ejecución está actualmente en progreso, omitiendo este ciclo.');
      return;
    }

    logger.info('[PriceAlertsWorker] Iniciando procesamiento de alertas activas...');
    this.isRunning = true;
    
    let processedCount = 0;
    let sentCount = 0;
    
    try {
      // Optimizacion Fase 6: Paginación para no reventar la memoria RAM con miles de registros
      // Prepared for future Queue integration (BullMQ / Redis)
      let offset = 0;
      const BATCH_SIZE = 500;
      let hasMoreMotorcycles = true;

      while (hasMoreMotorcycles) {
        // 1. Obtener lotes de motos únicas con alertas activas
        const motorcyclesWithAlerts = await db.motorcycle.findMany({
          take: BATCH_SIZE,
          skip: offset,
          where: {
            price: { not: null },
            priceAlerts: { some: { status: 'ACTIVE' } }
          },
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            price: true,
            imageUrl: true,
            priceAlerts: {
            where: { status: 'ACTIVE' },
            include: { user: { select: { id: true, email: true, fullName: true } } }
          }
        }
      });
      
      logger.info(`[PriceAlertsWorker] Se encontraron motos con alertas activas: ${motorcyclesWithAlerts.length}`);

      const now = new Date();
      
      // 2. Procesar validaciones y envíos
      for (const moto of motorcyclesWithAlerts) {
        if (!moto.price) continue;
        
        for (const alert of moto.priceAlerts) {
          processedCount++;
          
          // A) Validar precio: Precio actual debe ser MENOR o IGUAL al precio objetivo (`targetPrice`)
          if (moto.price.toNumber() > alert.targetPrice.toNumber()) {
            continue; // El precio actual aún es mayor al objetivo
          }
          
          // B) Validar Cooldown (Anti-spam)
          if (alert.lastNotifiedAt) {
            const hoursSinceLastNotified = (now - alert.lastNotifiedAt) / (1000 * 60 * 60);
            if (hoursSinceLastNotified < COOLDOWN_HOURS) {
              continue; // Aún en periodo de enfriamiento
            }
          }
          
          // C) Procesar el envío de la notificación (En Transaction para atar NotificationHistory y Update a la Alerta)
          try {
            await db.$transaction(async (tx) => {
              // Actualizar la alerta con lastNotifiedAt
              await tx.priceAlert.update({
                where: { id: alert.id },
                data: { lastNotifiedAt: now }
              });
              
              // Insertar el NotificationHistory
              await tx.notificationHistory.create({
                data: {
                  userId: alert.user.id,
                  alertId: alert.id,
                  motorcycleId: moto.id,
                  previousPrice: alert.targetPrice, // Opcional: obtener un precio de un histórico general, tomamos el target
                  newPrice: moto.price,
                  type: alert.notificationType
                }
              });
            });
            
            // Disparar correo si aplica
            if (alert.notificationType === 'EMAIL' || alert.notificationType === 'BOTH') {
              await sendPriceAlertEmail({
                to: alert.user.email,
                name: alert.user.fullName,
                motorcycle: moto,
                targetPrice: alert.targetPrice.toNumber(),
                currentPrice: moto.price.toNumber()
              });
            }
            
            sentCount++;
            
          } catch (txError) {
            logger.error(`[PriceAlertsWorker] Error al procesar alerta ${alert.id} para usuario ${alert.user.id}: ${txError.message}`);
          }
        }
      }

        // Paginación: si obtuvimos menos motos del límite del lote, terminamos
        if (motorcyclesWithAlerts.length < BATCH_SIZE) {
          hasMoreMotorcycles = false;
        } else {
          offset += BATCH_SIZE;
        }
      } // Fin del while (hasMoreMotorcycles)
      
      logger.info(`[PriceAlertsWorker] Procesamiento finalizado. Alertas estimadas: ${processedCount}. Notificaciones enviadas: ${sentCount}.`);
      
    } catch (error) {
      logger.error(`[PriceAlertsWorker] Error crítico en el cron: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = new PriceAlertsWorker();
