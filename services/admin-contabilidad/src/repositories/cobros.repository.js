const { sequelize } = require('../config/db');

// ========== CREAR COBRO ==========

const crearCobro = async (data, transaction = null) => {
    const result = await sequelize.query(
        `INSERT INTO cobro
        (cliente_id, pedido_id, monto_total, tarifa_servicio, propina, 
        tipo_pago, repartidor_id, cupon_id, estado, numero_transaccion,
        idempotency_key, estado_reconciliacion, payment_id_cobros,
        transaction_id_banco, ultimo_error_externo, reconciliado)
        VALUES (
            :cliente_id,
            :pedido_id,
            :monto_total,
            :tarifa_servicio,
            :propina,
            :tipo_pago,
            :repartidor_id,
            :cupon_id,
            :estado,
            :numero_transaccion,
            :idempotency_key,
            :estado_reconciliacion,
            :payment_id_cobros,
            :transaction_id_banco,
            :ultimo_error_externo,
            :reconciliado
        )
        RETURNING *`,
        {
            replacements: {
                cliente_id: data.cliente_id,
                pedido_id: data.pedido_id,
                monto_total: data.monto_total,
                tarifa_servicio: data.tarifa_servicio || 0,
                propina: data.propina || 0,
                tipo_pago: data.tipo_pago,
                repartidor_id: data.repartidor_id || null,
                cupon_id: data.cupon_id || null,
                estado: data.estado || 'completado',
                numero_transaccion: data.numero_transaccion || null,
                idempotency_key: data.idempotency_key,
                estado_reconciliacion:
                    data.estado_reconciliacion || 'pendiente',

                payment_id_cobros:
                    data.payment_id_cobros || null,

                transaction_id_banco:
                    data.transaction_id_banco || null,

                ultimo_error_externo:
                    data.ultimo_error_externo || null,

                reconciliado:
                    data.reconciliado || false
            },
            type: sequelize.QueryTypes.INSERT,
            transaction
        }
    );
    return result[0][0];
};

// ========== OBTENER COBROS ==========

const obtenerCobroPorIdempotencyKey = async (key) => {
    const result = await sequelize.query(
        `SELECT * FROM cobro 
         WHERE idempotency_key = :key 
         LIMIT 1`,
        {
            replacements: { key },
            type: sequelize.QueryTypes.SELECT
        }
    );
    return result[0];
};

const obtenerCobros = async (filtros = {}) => {
    let query = `SELECT * FROM cobro WHERE 1=1`;
    const replacements = {};

    if (filtros.estado) {
        query += ` AND estado = :estado`;
        replacements.estado = filtros.estado;
    }

    if (filtros.tipo_pago) {
        query += ` AND tipo_pago = :tipo_pago`;
        replacements.tipo_pago = filtros.tipo_pago;
    }

    if (filtros.inicio && filtros.fin) {
        query += ` AND DATE(fecha_cobro) BETWEEN :inicio AND :fin`;
        replacements.inicio = filtros.inicio;
        replacements.fin = filtros.fin;
    }

    if (filtros.cliente_id) {
        query += ` AND cliente_id = :cliente_id`;
        replacements.cliente_id = filtros.cliente_id;
    }

    query += ` ORDER BY fecha_cobro DESC`;

    return await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });
};

const obtenerCobroPorId = async (id) => {
    const result = await sequelize.query(
        `SELECT * FROM cobro WHERE id = :id`,
        {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT
        }
    );
    return result[0];
};

// ========== COBROS POR REPARTIDOR ==========

const obtenerCobrosPorRepartidor = async (repartidor_id) => {
    return await sequelize.query(
        `SELECT * FROM cobro WHERE repartidor_id = :repartidor_id ORDER BY fecha_cobro DESC`,
        {
            replacements: { repartidor_id },
            type: sequelize.QueryTypes.SELECT
        }
    );
};

const obtenerSaldoRepartidor = async (repartidor_id) => {
    const result = await sequelize.query(
        `SELECT 
            COALESCE(SUM(CASE WHEN tipo_pago = 'tarjeta' THEN propina + tarifa_servicio ELSE 0 END), 0) as credito,
            COALESCE(SUM(CASE WHEN tipo_pago = 'efectivo' THEN propina + tarifa_servicio ELSE 0 END), 0) as debito
        FROM cobro 
        WHERE repartidor_id = :repartidor_id AND estado = 'completado'`,
        {
            replacements: { repartidor_id },
            type: sequelize.QueryTypes.SELECT
        }
    );
    
    const saldos = result[0];
    return {
        credito: parseFloat(saldos.credito) || 0,
        debito: parseFloat(saldos.debito) || 0,
        saldo_neto: (parseFloat(saldos.credito) || 0) - (parseFloat(saldos.debito) || 0)
    };
};

// ========== REGISTRAR INTENTO FALLIDO ==========

const registrarIntentoDenegado = async (data, transaction = null) => {
    const result = await sequelize.query(
        `INSERT INTO cobro_denegado
        (cliente_id, pedido_id, monto_intentado, razon, tipo_pago, repartidor_id)
        VALUES (:cliente_id, :pedido_id, :monto_intentado, :razon, :tipo_pago, :repartidor_id)
        RETURNING *`,
        {
            replacements: data,
            type: sequelize.QueryTypes.INSERT,
            transaction
        }
    );
    return result[0][0];
};

// ========== REGISTRAR CANCELACIÓN ==========

const registrarCancelacion = async (data, transaction = null) => {
    const result = await sequelize.query(
        `INSERT INTO cobro_cancelado
        (cobro_id, razon, reembolsado, monto_reembolso)
        VALUES (:cobro_id, :razon, :reembolsado, :monto_reembolso)
        RETURNING *`,
        {
            replacements: data,
            type: sequelize.QueryTypes.INSERT,
            transaction
        }
    );
    return result[0][0];
};

// ========== OBTENER ESTADÍSTICAS ==========

const obtenerEstadisticasCobros = async (inicio, fin) => {
    return await sequelize.query(
        `SELECT 
            COUNT(*) as total_cobros,
            SUM(monto_total) as monto_total,
            COUNT(CASE WHEN tipo_pago = 'tarjeta' THEN 1 END) as cobros_tarjeta,
            COUNT(CASE WHEN tipo_pago = 'efectivo' THEN 1 END) as cobros_efectivo,
            COUNT(CASE WHEN tipo_pago = 'cupon' THEN 1 END) as cobros_cupon,
            SUM(CASE WHEN estado = 'denegado' THEN 1 ELSE 0 END) as cobros_denegados
        FROM cobro
        WHERE DATE(fecha_cobro) BETWEEN :inicio AND :fin`,
        {
            replacements: { inicio, fin },
            type: sequelize.QueryTypes.SELECT
        }
    );
};

const actualizarEstadoCobro = async (cobro_id, nuevoEstado, transaction = null) => {
    const result = await sequelize.query(
        `UPDATE cobro 
         SET estado = :estado, updated_at = CURRENT_TIMESTAMP 
         WHERE id = :id 
         RETURNING *`,
        {
            replacements: {
                id: cobro_id,
                estado: nuevoEstado
            },
            type: sequelize.QueryTypes.UPDATE,
            transaction
        }
    );
    return result[0];
};

const obtenerCobroPorPedidoYCliente = async (pedido_id, cliente_id) => {
    const result = await sequelize.query(
        `SELECT * FROM cobro 
         WHERE pedido_id = :pedido_id 
         AND cliente_id = :cliente_id
         ORDER BY fecha_cobro DESC
         LIMIT 1`,
        {
            replacements: { pedido_id, cliente_id },
            type: sequelize.QueryTypes.SELECT
        }
    );
    return result[0];
};

module.exports = {
    crearCobro,
    obtenerCobros,
    obtenerCobroPorId,
    obtenerCobrosPorRepartidor,
    obtenerSaldoRepartidor,
    registrarIntentoDenegado,
    registrarCancelacion,
    obtenerEstadisticasCobros,
    actualizarEstadoCobro,
    obtenerCobroPorPedidoYCliente,
    obtenerCobroPorIdempotencyKey
};