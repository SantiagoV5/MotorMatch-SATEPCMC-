const app              = require('./app');
const { PORT }         = require('./config/environment');
const { logger }       = require('./utils/logger');
const priceAlertsWorker= require('./workers/priceAlerts.worker');

app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📦 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Iniciar worker de cron jobs
  if (process.env.NODE_ENV !== 'test') {
    priceAlertsWorker.init();
  }
});
