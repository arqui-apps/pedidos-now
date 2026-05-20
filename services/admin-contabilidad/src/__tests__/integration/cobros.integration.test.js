const { sequelize } = require('../../../src/config/db');
const { Pool } = require('pg');
require('dotenv').config();

describe('Cobros - Integration Tests (BD Real Neon.tech)', () => {
    const testPayload = {
        cliente_id: 999,
        pedido_id: 888,
        monto_total: 100.00,
        tarifa_servicio: 8.00,
        propina: 10.00,
        tipo_pago: 'tarjeta',
        repartidor_id: 777
    };

    let pool;
    let client;

    // ========== SETUP ==========
    beforeAll(async () => {
        try {
            pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            });
            client = await pool.connect();
            console.log('\n✅ Conexión a BD establecida para tests de integración');
        } catch (err) {
            console.error('❌ Error en beforeAll:', err.message);
            throw err;
        }
    });

    // ========== CLEANUP ==========
    afterAll(async () => {
        try {
            if (client) {
                await client.query('DELETE FROM cobro WHERE cliente_id = $1', [testPayload.cliente_id]);
                client.release();
            }
            if (pool) await pool.end();
            console.log('✅ Limpieza completada\n');
        } catch (err) {
            console.error('⚠️  Error en afterAll:', err.message);
        }
    });

    // ========== TESTS ==========

    test('BD - Debe tener tabla cobro', async () => {
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'cobro'
        `);

        expect(result.rows.length).toBe(1);
        console.log('  ✅ Tabla cobro existe');
    });

    test('BD - Debe tener tabla cobro_denegado', async () => {
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'cobro_denegado'
        `);

        expect(result.rows.length).toBe(1);
        console.log('  ✅ Tabla cobro_denegado existe');
    });

    test('BD - Debe tener tabla cobro_cancelado', async () => {
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'cobro_cancelado'
        `);

        expect(result.rows.length).toBe(1);
        console.log('  ✅ Tabla cobro_cancelado existe');
    });

    test('BD - Puede insertar un cobro', async () => {
        const result = await client.query(
            `INSERT INTO cobro (cliente_id, pedido_id, monto_total, tarifa_servicio, propina, tipo_pago, repartidor_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [testPayload.cliente_id, testPayload.pedido_id, testPayload.monto_total, testPayload.tarifa_servicio, testPayload.propina, testPayload.tipo_pago, testPayload.repartidor_id]
        );

        expect(result.rows.length).toBe(1);
        expect(result.rows[0].id).toBeDefined();
        console.log(`  ✅ Cobro insertado con ID: ${result.rows[0].id}`);
    });

    test('BD - Puede recuperar un cobro por ID', async () => {
        // Insertar
        const insert = await client.query(
            `INSERT INTO cobro (cliente_id, pedido_id, monto_total, tarifa_servicio, propina, tipo_pago, repartidor_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [testPayload.cliente_id, testPayload.pedido_id, testPayload.monto_total, testPayload.tarifa_servicio, testPayload.propina, testPayload.tipo_pago, testPayload.repartidor_id]
        );

        const cobroId = insert.rows[0].id;

        // Recuperar
        const select = await client.query(
            `SELECT * FROM cobro WHERE id = $1`,
            [cobroId]
        );

        expect(select.rows.length).toBe(1);
        // PostgreSQL devuelve DECIMAL como string, convertir a número
        expect(parseFloat(select.rows[0].monto_total)).toBe(testPayload.monto_total);
        console.log(`  ✅ Cobro ${cobroId} recuperado correctamente`);
    });

    test('BD - Puede insertar un cobro_cancelado', async () => {
        // Insertar cobro
        const cobro = await client.query(
            `INSERT INTO cobro (cliente_id, pedido_id, monto_total, tarifa_servicio, propina, tipo_pago, repartidor_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [testPayload.cliente_id, testPayload.pedido_id, testPayload.monto_total, testPayload.tarifa_servicio, testPayload.propina, testPayload.tipo_pago, testPayload.repartidor_id]
        );

        const cobroId = cobro.rows[0].id;

        // Insertar cancelado
        const result = await client.query(
            `INSERT INTO cobro_cancelado (cobro_id, razon, reembolsado, monto_reembolso)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [cobroId, 'Prueba de cancelación', false, 0]
        );

        expect(result.rows.length).toBe(1);
        console.log(`  ✅ Cobro cancelado insertado`);
    });

    test('BD - Puede listar todos los cobros', async () => {
        const result = await client.query('SELECT COUNT(*) FROM cobro');
        // PostgreSQL devuelve COUNT como string, convertir a número
        const count = parseInt(result.rows[0].count, 10);
        expect(count).toBeGreaterThanOrEqual(0);
        console.log(`  ✅ Total de cobros: ${count}`);
    });
});