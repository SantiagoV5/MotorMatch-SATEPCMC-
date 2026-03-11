const app              = require('./app');
const { PORT }         = require('./config/environment');
const { logger }       = require('./utils/logger');

app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📦 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
