const {
    sequelize,
    query: dbQuery
} = require('../config/db');

// ========== CREAR MOVIMIENTO ==========
const crearMovimiento = async (data, transaction = null) => {
    const result = await sequelize.query(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen,
        referencia_id, monto, descripcion,
        pedido_id, repartidor_id, estado, fecha,
        transaction_id_banco,
        payment_id_cobros,
        idempotency_key)
        VALUES (
        :cuenta_id, :tipo, :subtipo, :modulo_origen,
        :referencia_id, :monto, :descripcion,
        :pedido_id, :repartidor_id, :estado,
        CURRENT_TIMESTAMP,
        :transaction_id_banco,
        :payment_id_cobros,
        :idempotency_key
        )
        RETURNING *`,
        {
            replacements: {
                cuenta_id: data.cuenta_id,
                tipo: data.tipo, // 'ingreso' o 'egreso'
                subtipo: data.subtipo, // 'cobro_cliente', 'reembolso', etc.
                modulo_origen: data.modulo_origen,
                referencia_id: data.referencia_id || null,
                monto: data.monto,
                descripcion: data.descripcion,
                pedido_id: data.pedido_id || null,
                repartidor_id: data.repartidor_id || null,
                estado: data.estado || 'completado',
                transaction_id_banco:
                    data.transaction_id_banco || null,
                payment_id_cobros:
                    data.payment_id_cobros || null,
                idempotency_key:
                    data.idempotency_key || null
            },
            type: sequelize.QueryTypes.INSERT,
            transaction
        }
    );
    return result[0][0];
};

// ========== OBTENER MOVIMIENTOS ==========

const obtenerMovimientos = async (filtros = {}) => {
    let query = `SELECT * FROM movimiento_financiero WHERE 1=1`;
    const replacements = {};

    if (filtros.cuenta_id) {
        query += ` AND cuenta_id = :cuenta_id`;
        replacements.cuenta_id = filtros.cuenta_id;
    }

    if (filtros.tipo) {
        query += ` AND tipo = :tipo`;
        replacements.tipo = filtros.tipo;
    }

    if (filtros.subtipo) {
        query += ` AND subtipo = :subtipo`;
        replacements.subtipo = filtros.subtipo;
    }

    if (filtros.estado) {
        query += ` AND estado = :estado`;
        replacements.estado = filtros.estado;
    }

    if (filtros.inicio && filtros.fin) {
        query += ` AND DATE(fecha) BETWEEN :inicio AND :fin`;
        replacements.inicio = filtros.inicio;
        replacements.fin = filtros.fin;
    }

    query += ` ORDER BY fecha DESC`;

    return await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });
};

// ========== OBTENER SALDO ACTUAL ==========

const obtenerSaldoActual = async (cuenta_id) => {
    const result = await sequelize.query(
        `SELECT 
            COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) as ingresos,
            COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0) as egresos
        FROM movimiento_financiero 
        WHERE cuenta_id = :cuenta_id AND estado = 'completado'`,
        {
            replacements: { cuenta_id },
            type: sequelize.QueryTypes.SELECT
        }
    );

    const movimientos = result[0];
    const saldo_actual = parseFloat(movimientos.ingresos) - parseFloat(movimientos.egresos);

    return {
        ingresos: parseFloat(movimientos.ingresos),
        egresos: parseFloat(movimientos.egresos),
        saldo_actual
    };
};

const crearEgreso = async (data) => {

    return await crearMovimiento({
        cuenta_id: data.cuenta_id || 2,
        tipo: 'egreso',
        subtipo: 'reembolso',
        modulo_origen: 'reembolsos',
        referencia_id: data.referencia_id,
        monto: data.monto,
        descripcion: data.descripcion,
        pedido_id: data.pedido_id || null,
        repartidor_id: null,
        estado: 'completado'
    });
};

const restarSaldo = async () => {
    return true;
};

//Admin Emmanuel 
const getMovimientoById = async (id) => {
    const result = await dbQuery(
        `SELECT *
        FROM movimiento_financiero
        WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
};

const updateMovimiento = async (id, data) => {
    const movimientoActual = await getMovimientoById(id);

    if (!movimientoActual) {
        return null;
    }

    const result = await dbQuery(
        `UPDATE movimiento_financiero
        SET 
            cuenta_id = $1,
            tipo = $2,
            subtipo = $3,
            modulo_origen = $4,
            referencia_id = $5,
            monto = $6,
            descripcion = $7,
            pedido_id = $8,
            repartidor_id = $9,
            estado = $10
        WHERE id = $11
        RETURNING *`,
        [
            data.cuenta_id ?? movimientoActual.cuenta_id,
            data.tipo ?? movimientoActual.tipo,
            data.subtipo ?? movimientoActual.subtipo,
            data.modulo_origen ?? movimientoActual.modulo_origen,
            data.referencia_id ?? movimientoActual.referencia_id,
            data.monto ?? movimientoActual.monto,
            data.descripcion ?? movimientoActual.descripcion,
            data.pedido_id ?? movimientoActual.pedido_id,
            data.repartidor_id ?? movimientoActual.repartidor_id,
            data.estado ?? movimientoActual.estado,
            id
        ]
    );

    return result.rows[0];
};

const deleteMovimiento = async (id) => {
    const result = await dbQuery(
        `DELETE FROM movimiento_financiero
        WHERE id = $1
        RETURNING id`,
        [id]
    );

    return result.rows.length > 0;
};

const ingresoPedido = async (data) => {
    const result = await dbQuery(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen,
        referencia_id, monto, descripcion,
        pedido_id, repartidor_id, estado)
        VALUES ($1, 'ingreso', 'pedido', $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
            data.cuenta_id || 1,
            data.modulo_origen || 'broker',
            data.referencia_id || null,
            data.monto,
            data.descripcion || 'Ingreso por pedido',
            data.pedido_id || null,
            data.repartidor_id || null,
            data.estado || 'procesado'
        ]
    );

    return result.rows[0];
};

const egreso = async (data) => {
    const result = await dbQuery(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen,
        referencia_id, monto, descripcion,
        pedido_id, repartidor_id, estado)
        VALUES ($1, 'egreso', $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
            data.cuenta_id || 1,
            data.subtipo || 'general',
            data.modulo_origen || 'admin-contabilidad',
            data.referencia_id || null,
            data.monto,
            data.descripcion || 'Egreso registrado',
            data.pedido_id || null,
            data.repartidor_id || null,
            data.estado || 'procesado'
        ]
    );

    return result.rows[0];
};

const getFondoReembolsos = async () => {
    const result = await dbQuery(
        `SELECT 
            COALESCE(SUM(
                CASE 
                    WHEN tipo = 'ingreso' AND subtipo = 'fondo_reembolsos' THEN monto
                    WHEN tipo = 'egreso' AND subtipo = 'reembolso' THEN -monto
                    ELSE 0
                END
            ), 0) AS saldo_fondo_reembolsos
        FROM movimiento_financiero`
    );

    return result.rows[0];
};

const recargarFondo = async (data) => {
    const result = await dbQuery(
        `INSERT INTO movimiento_financiero
        (cuenta_id, tipo, subtipo, modulo_origen,
        referencia_id, monto, descripcion, estado)
        VALUES ($1, 'ingreso', 'fondo_reembolsos', $2, $3, $4, $5, 'procesado')
        RETURNING *`,
        [
            data.cuenta_id || 1,
            data.modulo_origen || 'admin-contabilidad',
            data.referencia_id || null,
            data.monto,
            data.descripcion || 'Recarga de fondo de reembolsos'
        ]
    );

    return result.rows[0];
};

module.exports = {
    crearMovimiento,
    obtenerMovimientos,
    obtenerSaldoActual,
    crearEgreso,

    restarSaldo,

    getMovimientoById,
    updateMovimiento,
    deleteMovimiento,

    ingresoPedido,
    egreso,

    getFondoReembolsos,
    recargarFondo
};