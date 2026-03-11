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

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,

  // PostgreSQL
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT — autenticación propia con bcryptjs + jsonwebtoken
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};
