require('dotenv').config();

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Variable de entorno requerida no encontrada: ${key}`);
  }
});

// GROQ_API_KEY es opcional en arranque (aviso en consola, error al usarla)
if (!process.env.GROQ_API_KEY) {
  console.warn('⚠️  GROQ_API_KEY no configurada — el chat con IA no estará disponible.');
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,

  // PostgreSQL
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT — autenticación propia con bcryptjs + jsonwebtoken
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Groq (chat IA)
  GROQ_API_KEY: process.env.GROQ_API_KEY,
};
