require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,

  // Database - PostgreSQL (Railway provee DATABASE_URL automáticamente)
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://root:lufi2110@localhost:5432/modulo_restaurantes',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  
  // External Services
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  BROKER_SERVICE_URL: process.env.BROKER_SERVICE_URL || 'http://localhost:3002',
  DESCUENTOS_SERVICE_URL: process.env.DESCUENTOS_SERVICE_URL || 'http://localhost:3003',
  COBROS_SERVICE_URL: process.env.COBROS_SERVICE_URL || 'http://localhost:3004'
};
