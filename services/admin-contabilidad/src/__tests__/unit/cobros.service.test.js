const request = require('supertest');
const jwt = require('jsonwebtoken'); // AGREGAR
const app = require('../../app');
const { sequelize } = require('../../src/config/db');
const { Pool } = require('pg');
require('dotenv').config();

describe('Cobros - Integration Tests (BD Real Neon.tech)', () => {
    let token;
    let cobroId;
    const testPayload = {
        cliente_id: 999,
        pedido_id: 888,
        monto_total: 100.00,
        tarifa_servicio: 8.00,
        propina: 10.00,
        tipo_pago: 'tarjeta',
        repartidor_id: 777
    };

    // ========== SETUP ==========
    beforeAll(async () => {
        try {
            // Conectar a BD
            await sequelize.authenticate();
            console.log('✅ Conexión a BD establecida para tests de integración');

            // 🔴 GENERAR TOKEN JWT VÁLIDO (nuevo)
            token = jwt.sign(
                { 
                    id: 1, 
                    email: 'test@test.com', 
                    rol: 'admin' 
                },
                process.env.JWT_SECRET || 'test-secret',
                { expiresIn: '24h' }
            );
            console.log('✅ Token JWT válido generado');

        } catch (err) {
            console.error('❌ Error en beforeAll:', err.message);
            throw err;
        }
    });

    // ========== CLEANUP (sin cambios) ==========
    afterAll(async () => {
        try {
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            });
            const client = await pool.connect();

            await client.query('DELETE FROM cobro WHERE cliente_id = $1', [testPayload.cliente_id]);

            client.release();
            await pool.end();
            await sequelize.close();
            console.log('✅ Limpieza completada');
        } catch (err) {
            console.error('⚠️  Error en afterAll:', err.message);
        }
    });

    // ========== TESTS (resto igual) ==========
    // ... resto del archivo sin cambios
});