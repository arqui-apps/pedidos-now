// Admin-contabilidad Kenneth

require('dotenv').config();

console.log('🚀 Iniciando prueba...');

const db = require('./src/config/db');

(async () => {
  try {
    console.log('⏳ Intentando conectar...');

    const result = await db.query('SELECT NOW()');

    console.log('✅ Conectado a Neon:', result.rows[0]);

  } catch (error) {
    console.error('❌ Error conexión:', error);
  } finally {
    console.log('🏁 Fin del script');
    process.exit();
  }
})();