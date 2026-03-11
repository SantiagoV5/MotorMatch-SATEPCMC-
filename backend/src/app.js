const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const { NODE_ENV } = require('./config/environment');
const errorHandler = require('./middlewares/error.handler');

// ─── Rutas (se irán añadiendo por módulo) ───────────────────────────────────
const authRoutes        = require('./modules/auth/auth.routes');
const motorcycleRoutes  = require('./modules/motorcycles/motorcycle.routes');
const questionnaireRoutes = require('./modules/questionnaire/questionnaire.routes');

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

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: NODE_ENV });
});

// ─── 404 para rutas no definidas ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// ─── Manejador centralizado de errores (debe ir al final) ────────────────────
app.use(errorHandler);

module.exports = app;
