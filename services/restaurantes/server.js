const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database');
const env = require('./src/config/env');

const startServer = async () => {
  try {
    // Probar conexión a la BD
    await testConnection();
    
    // Sincronizar modelos solo en desarrollo o primera vez
    if (env.NODE_ENV === 'production') {
      // En producción: solo verificar conexión, no sincronizar
      console.log('📦 Modo producción: Base de datos lista (sin sincronización automática).');
    } else {
      // En desarrollo: permite modificar estructura
      await sequelize.sync({ alter: true });
      console.log('📦 Modelos sincronizados (desarrollo: con alter).');
    }
    
    // Iniciar servidor
    const PORT = env.PORT;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en 0.0.0.0:${PORT}`);
      console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
