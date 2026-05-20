require('dotenv').config();
const { Pool } = require('pg');

async function resetDB() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();

    try {
        console.log('🔄 Reseteando base de datos...\n');

        // Eliminar todas las tablas existentes
        await client.query(`
            DROP TABLE IF EXISTS cobro_cancelado CASCADE;
            DROP TABLE IF EXISTS cobro_denegado CASCADE;
            DROP TABLE IF EXISTS cobro CASCADE;
            DROP TABLE IF EXISTS migrations CASCADE;
        `);

        console.log('✅ Tablas eliminadas');

        // Crear tabla de migraciones
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL UNIQUE,
                ejecutada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Tabla de migraciones creada\n');

    } finally {
        client.release();
        await pool.end();
    }
}

resetDB().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});