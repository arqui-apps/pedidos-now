import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];

for (const variableName of requiredEnvVars) {
  if (!process.env[variableName]) {
    throw new Error(`Falta la variable de entorno: ${variableName}`);
  }
}

const env = {
  port: Number(process.env.PORT) || 3004,
  dbHost: process.env.DB_HOST,
  dbPort: Number(process.env.DB_PORT),
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME,
};

export default env;