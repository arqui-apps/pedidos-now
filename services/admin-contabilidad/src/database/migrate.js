require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    const client = await pool.connect();

    try {
        // Crear tabla de migraciones si no existe
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL UNIQUE,
                ejecutada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Obtener migraciones ya ejecutadas
        const resultado = await client.query('SELECT nombre FROM migrations');
        const yaEjecutadas = new Set(resultado.rows.map(r => r.nombre));

        // Leer archivos de migraciones
        const archivos = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort();

        const pendientes = archivos.filter(f => !yaEjecutadas.has(f));

        if (pendientes.length === 0) {
            console.log('✅ Sin migraciones pendientes.');
            return;
        }

        console.log(`📦 ${pendientes.length} migración(es) pendiente(s):\n`);

        // Ejecutar cada migración pendiente
        for (const archivo of pendientes) {
            const rutaCompleta = path.join(MIGRATIONS_DIR, archivo);
            const sql = fs.readFileSync(rutaCompleta, 'utf8');

            process.stdout.write(`  ➜ ${archivo} ... `);

            try {
                // Usar transacción
                await client.query('BEGIN');
                await client.query(sql);
                await client.query('INSERT INTO migrations (nombre) VALUES ($1)', [archivo]);
                await client.query('COMMIT');
                console.log('OK');
            } catch (err) {
                await client.query('ROLLBACK');
                console.log('ERROR');
                console.error(`\n❌ Falló: ${archivo}`);
                console.error(`   ${err.message}\n`);
                throw err; // Detener si hay error
            }
        }

        console.log('\n✅ Todas las migraciones ejecutadas correctamente.');

    } finally {
        client.release();
        await pool.end();
    }
}

run().catch(err => {
    console.error('Error en migraciones:', err.message);
    process.exit(1);
});