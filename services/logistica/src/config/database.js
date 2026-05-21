/**
 * Configuración de la conexión a la base de datos
 * Compatible con PostgreSQL en Docker
 */

const { Sequelize } = require('sequelize');
const env = require('./env');

// Configuración de Sequelize para PostgreSQL
const sequelize = new Sequelize(
    env.DB_NAME,
    env.DB_USER,
    env.DB_PASSWORD,
    {
        host: env.DB_HOST,
        port: env.DB_PORT,
        dialect: 'postgres',
        logging: env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true
        }
    }
);

/**
 * Función para probar la conexión a la base de datos
 */
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ [LOGÍSTICA] Conexión a PostgreSQL establecida correctamente.');
        console.log(`   📍 Host: ${env.DB_HOST}:${env.DB_PORT}`);
        console.log(`   🗄️  Base de datos: ${env.DB_NAME}`);
        return true;
    } catch (error) {
        console.error('❌ [LOGÍSTICA] Error al conectar con PostgreSQL:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Sugerencia: Verifica que PostgreSQL esté corriendo en Docker');
            console.log('   docker ps | grep postgres');
        } else if (error.message.includes('authentication failed')) {
            console.log('💡 Sugerencia: Verifica las credenciales en .env');
        } else if (error.message.includes('does not exist')) {
            console.log('💡 Sugerencia: La base de datos no existe. Créala con:');
            console.log(`   docker exec -it <postgres-container> psql -U ${env.DB_USER} -c "CREATE DATABASE ${env.DB_NAME};"`);
        }
        
        return false;
    }
};

module.exports = {
    sequelize,
    testConnection
};
