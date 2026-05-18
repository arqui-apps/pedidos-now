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
    DB_PORT: process.env.DB_PORT || 5432,
    DB_SSL: process.env.DB_SSL === 'true',

    // Integraciones externas
    RESTAURANTES_API_URL: process.env.RESTAURANTES_API_URL || 'https://restaurantes.fly.dev/api',
    ADMINISTRACION_API_URL: process.env.ADMINISTRACION_API_URL || 'https://pedidosnow-administracion-production.up.railway.app',
    LOGISTICA_MODULE_NAME: process.env.LOGISTICA_MODULE_NAME || 'logistica'
};
