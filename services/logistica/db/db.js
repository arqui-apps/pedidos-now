const { Sequelize } = require('sequelize');

// Nombre de la base de datos
const DB_NAME = process.env.DB_NAME || 'modulo_logistica_db';

// Conexión a PostgreSQL sin especificar base de datos (para crearla)
const sequelizeAdmin = new Sequelize(
    'postgres', // Base de datos por defecto de PostgreSQL
    process.env.DB_USER || 'admin',
    process.env.DB_PASSWORD || 'admin123',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false
    }
);

// Configuración de la base de datos principal
const sequelize = new Sequelize(
    DB_NAME,
    process.env.DB_USER || 'admin',
    process.env.DB_PASSWORD || 'admin123',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true
        }
    }
);

// Función para crear la base de datos si no existe (PostgreSQL)
const createDatabaseIfNotExists = async () => {
    try {
        console.log(`🔍 [LOGÍSTICA] Verificando si la base de datos '${DB_NAME}' existe...`);
        
        // Conectar a la base de datos 'postgres' por defecto
        await sequelizeAdmin.authenticate();
        
        // Verificar si la base de datos existe
        const [results] = await sequelizeAdmin.query(
            `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`
        );
        
        if (results.length === 0) {
            // La base de datos no existe, crearla
            console.log(`🔧 [LOGÍSTICA] Creando base de datos '${DB_NAME}'...`);
            await sequelizeAdmin.query(`CREATE DATABASE ${DB_NAME}`);
            console.log(`✅ [LOGÍSTICA] Base de datos '${DB_NAME}' creada exitosamente.`);
        } else {
            console.log(`✅ [LOGÍSTICA] Base de datos '${DB_NAME}' ya existe.`);
        }
        
        await sequelizeAdmin.close();
        return true;
    } catch (error) {
        console.error('❌ [LOGÍSTICA] Error al crear/verificar la base de datos:', error.message);
        try {
            await sequelizeAdmin.close();
        } catch (e) {
            // Ignorar errores al cerrar
        }
        return false;
    }
};

// Función para probar la conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ [LOGÍSTICA] Conexión a la base de datos establecida correctamente.');
        return true;
    } catch (error) {
        console.error('❌ [LOGÍSTICA] Error al conectar con la base de datos:', error.message);
        return false;
    }
};

// Función para sincronizar modelos (solo en desarrollo)
const syncDatabase = async (options = {}) => {
    try {
        await sequelize.sync(options);
        console.log('✅ [LOGÍSTICA] Modelos sincronizados con la base de datos.');
        return true;
    } catch (error) {
        console.error('❌ [LOGÍSTICA] Error al sincronizar modelos:', error.message);
        return false;
    }
};

// Función para inicializar la base de datos completa
const initDatabase = async (options = {}) => {
    try {
        console.log('\n🔧 [LOGÍSTICA] Iniciando configuración de base de datos...\n');
        
        // 1. Crear base de datos si no existe
        await createDatabaseIfNotExists();
        
        // 2. Probar conexión
        const connected = await testConnection();
        if (!connected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        
        // 3. Sincronizar modelos
        console.log('\n🔄 [LOGÍSTICA] Sincronizando modelos...');
        await syncDatabase(options);
        
        console.log('\n✅ [LOGÍSTICA] Base de datos inicializada correctamente.\n');
        return true;
    } catch (error) {
        console.error('\n❌ [LOGÍSTICA] Error al inicializar base de datos:', error.message);
        return false;
    }
};

module.exports = sequelize;
module.exports.sequelize = sequelize;
module.exports.testConnection = testConnection;
module.exports.syncDatabase = syncDatabase;
module.exports.createDatabaseIfNotExists = createDatabaseIfNotExists;
module.exports.initDatabase = initDatabase;

