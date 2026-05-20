const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const { NODE_ENV } = require('./config/environment');
const errorHandler = require('./middlewares/error.handler');
const prisma       = require('./config/database');

// ─── Rutas (se irán añadiendo por módulo) ───────────────────────────────────
const authRoutes        = require('./modules/auth/auth.routes');
const motorcycleRoutes  = require('./modules/motorcycles/motorcycle.routes');
const questionnaireRoutes = require('./modules/questionnaire/questionnaire.routes');
const favoritesRoutes     = require('./modules/favorites/favorites.routes');
const usersRoutes         = require('./modules/users/user.routes');
const comparisonsRoutes   = require('./modules/comparisons/comparisons.routes');
const costSimulatorRoutes = require('./modules/costSimulator/costSimulator.routes');
const marketAnalysisRoutes = require('./modules/marketAnalysis/marketAnalysis.routes');
const analyticsRoutes     = require('./modules/analytics/share.routes');
const feedbackRoutes      = require('./modules/feedback/feedback.routes');
const supportRoutes       = require('./modules/support/support.routes');
const reviewRoutes        = require('./modules/reviews/review.routes');
const searchesRoutes      = require('./modules/searches/searches.routes');
const priceAlertsRoutes   = require('./modules/priceAlerts/priceAlerts.routes');
const aiRoutes            = require('./modules/ai/ai.routes'); // ← MotorMatch AI
const adminRoutes         = require('./modules/admin/admin.routes');

const app = express();

// ─── Middlewares globales ────────────────────────────────────────────────────
app.use(cors({
  origin: NODE_ENV === 'production'
    ? process.env.FRONTEND_URL          // dominio real en prod
    : 'http://localhost:5173',          // Vite en desarrollo
  credentials: true,
}));

app.use(express.json());               // parsear body JSON
app.use(express.urlencoded({ extended: false })); // parsear form-urlencoded

if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));               // logs de peticiones en consola
}

//─── Rutas de la API ─────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/motorcycles', motorcycleRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/comparisons', comparisonsRoutes);
app.use('/api/cost-simulator', costSimulatorRoutes);
app.use('/api/market-analysis', marketAnalysisRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/searches',  searchesRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/price-alerts', priceAlertsRoutes);
app.use('/api/ai', aiRoutes);          // ← MotorMatch AI
app.use('/api/admin', adminRoutes);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: NODE_ENV });
});

async function checkDatabaseHealth(_req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'reachable' });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'unreachable',
      code: err.code || err.name || 'UNKNOWN',
      message: err.message,
    });
  }
}

app.get('/api/health/db', checkDatabaseHealth);
app.get('/api/health/bd', checkDatabaseHealth);

// ─── 404 para rutas no definidas ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// ─── Manejador centralizado de errores (debe ir al final) ────────────────────
app.use(errorHandler);

module.exports = app;
