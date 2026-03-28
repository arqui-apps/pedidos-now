require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 3004,
  dbHost: process.env.DB_HOST,
  dbPort: Number(process.env.DB_PORT),
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME,
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = env;
