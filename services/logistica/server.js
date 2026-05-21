const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database');
const env = require('./src/config/env');

const startServer = async () => {
    try {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║        INICIANDO SERVIDOR - LOGÍSTICA v3.0               ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        // 1. Probar conexión a la BD
        console.log('🔌 Conectando a la base de datos...\n');
        const connected = await testConnection();
        
        if (!connected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        
        console.log('');

        // 2. Sincronizar modelos (solo en desarrollo o primera vez)
        if (env.NODE_ENV === 'production') {
            // En producción: solo verificar conexión, no sincronizar
            console.log('📦 Modo producción: Base de datos lista (sin sincronización automática).');
            console.log('   💡 Ejecuta "node syncDatabase.js" si necesitas crear/actualizar tablas.\n');
        } else {
            // En desarrollo: permite modificar estructura
            console.log('📦 Modo desarrollo: Sincronizando modelos...');
            require('./src/models'); // Cargar modelos
            await sequelize.sync({ alter: false });
            console.log('   ✅ Modelos sincronizados.\n');
        }
        
        // 3. Iniciar servidor
        const PORT = env.PORT;
        app.listen(PORT, '0.0.0.0', () => {
            console.log('╔═══════════════════════════════════════════════════════════╗');
            console.log('║              🚀 SERVIDOR INICIADO                         ║');
            console.log('╠═══════════════════════════════════════════════════════════╣');
            console.log(`║  Puerto: ${String(PORT).padEnd(50)} ║`);
            console.log(`║  Ambiente: ${env.NODE_ENV.padEnd(48)} ║`);
            console.log(`║  Base de datos: ${env.DB_NAME.padEnd(42)} ║`);
            console.log('╚═══════════════════════════════════════════════════════════╝\n');
            console.log(`📍 API disponible en: http://localhost:${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
        });
    } catch (error) {
        console.error('\n❌ ERROR AL INICIAR EL SERVIDOR:\n');
        console.error(`   ${error.message}\n`);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Sugerencia: PostgreSQL no está corriendo');
            console.log('   docker start postgres16\n');
        } else if (error.message.includes('does not exist')) {
            console.log('💡 Sugerencia: Ejecuta primero:');
            console.log('   node syncDatabase.js\n');
        }
        
        process.exit(1);
    }
};

startServer();
