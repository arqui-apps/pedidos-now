// Admin-contabilidad Kenneth

const db = require('../config/db');

const getAllMovimientos = async () => {
    const result = await db.query(
        'SELECT * FROM movimiento_financiero'
    );
    return result.rows;
};

const crearMovimiento = async (data) => {

    const result = await db.query(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen, 
        referencia_id, monto, descripcion, 
        pedido_id, repartidor_id, estado)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING id`,
        [
            data.cuenta_id || 1,
            data.tipo,
            data.subtipo,
            data.modulo_origen,
            data.referencia_id || null,
            data.monto,
            data.descripcion,
            data.pedido_id || null,
            data.repartidor_id || null,
            data.estado || 'pendiente'
        ]
    );

    return result.rows[0].id;
};

const actualizarSaldo = async (cuenta_id, monto) => {
    await db.query(
        `UPDATE cuenta_fondo
        SET saldo = saldo + $1
        WHERE id = $2`,
        [monto, cuenta_id]
    );
};

const restarSaldo = async (cuenta_id, monto) => {
    await db.query(
        `UPDATE cuenta_fondo
        SET saldo = saldo - $1
        WHERE id = $2`,
        [monto, cuenta_id]
    );
};

const crearEgreso = async (data) => {

    const result = await db.query(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen,
        referencia_id, monto, descripcion, estado)
        VALUES ($1, 'egreso', $2, 'reembolso', $3, $4, $5, 'procesado')
        RETURNING id`,
        [
            data.cuenta_id,
            data.subtipo,
            data.referencia_id,
            data.monto,
            data.descripcion
        ]
    );

    return result.rows[0].id;
};

const getFondos = async () => {
    const result = await db.query(
        'SELECT id, saldo FROM cuenta_fondo'
    );
    return result.rows;
};

module.exports = {
    crearMovimiento,
    actualizarSaldo,
    crearEgreso,
    restarSaldo,
    getFondos,
    getAllMovimientos
};