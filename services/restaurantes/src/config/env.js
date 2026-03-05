require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_NAME: process.env.DB_NAME || 'restaurantes_db',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  
  // External Services
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  BROKER_SERVICE_URL: process.env.BROKER_SERVICE_URL || 'http://localhost:3002',
  DESCUENTOS_SERVICE_URL: process.env.DESCUENTOS_SERVICE_URL || 'http://localhost:3003',
  COBROS_SERVICE_URL: process.env.COBROS_SERVICE_URL || 'http://localhost:3004'
};
