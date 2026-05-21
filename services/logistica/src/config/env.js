/**
 * Configuración del entorno
 * Carga variables del archivo .env
 */

require('dotenv').config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3005,
    
    // Base de datos
    DB_NAME: process.env.DB_NAME || 'modulo_logistica_db',
    DB_USER: process.env.DB_USER || 'admin',
    DB_PASSWORD: process.env.DB_PASSWORD || 'admin123',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || 5432
};
