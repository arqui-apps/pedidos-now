const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database');
const env = require('./src/config/env');

const startServer = async () => {
  try {
    // Probar conexión a la BD
    await testConnection();
    
    // Sincronizar modelos (en producción usar migraciones)
    if (env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('📦 Modelos sincronizados con la base de datos.');
    }
    
    // Iniciar servidor
    const PORT = env.PORT;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
