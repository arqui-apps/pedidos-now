const { sequelize, testConnection } = require('./src/config/database');
const env = require('./src/config/env');
// Importar todos los modelos para que Sequelize los registre
require('./src/models');

const syncDatabase = async () => {
  try {
    console.log('🔄 Iniciando sincronización de base de datos...');
    console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
    
    // Probar conexión
    await testConnection();
    
    // Sincronizar según el ambiente
    if (env.NODE_ENV === 'production') {
      // En producción: solo crea tablas nuevas, no modifica existentes
      await sequelize.sync({ alter: false });
      console.log('✅ Base de datos sincronizada (modo producción: solo creación).');
    } else {
      // En desarrollo: permite modificar estructura
      await sequelize.sync({ alter: true });
      console.log('✅ Base de datos sincronizada (modo desarrollo: con alter).');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    process.exit(1);
  }
};

syncDatabase();
