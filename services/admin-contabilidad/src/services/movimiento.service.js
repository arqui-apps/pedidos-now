const movRepo = require('../repositories/movimiento.repository');
const { sequelize } = require('../config/db');

// ========== CREAR INGRESO ==========

const crearIngreso = async (data) => {
    const movimiento = await movRepo.crearIngreso({
        ...data,
        estado: 'completado'
    });

    // Sumar al saldo
    await movRepo.sumarSaldo(data.cuenta_id, data.monto);

    return movimiento;
};

// ========== CREAR EGRESO ==========

const crearEgreso = async (data) => {
    const saldoAnterior = await movRepo.obtenerSaldoActual(data.cuenta_id);

    // Verificar fondos disponibles
    if (saldoAnterior < data.monto) {
        throw new Error('Fondos insuficientes');
    }

    const movimiento = await movRepo.crearEgreso({
        ...data,
        estado: 'completado'
    });

    // Restar del saldo
    await movRepo.restarSaldo(data.cuenta_id, data.monto);

    return movimiento;
};

// ========== OBTENER MOVIMIENTOS ==========

const obtenerMovimientos = async (filtros = {}) => {
    return await movRepo.obtenerMovimientos(filtros);
};

// ========== OBTENER SALDO ==========

const obtenerSaldo = async (cuenta_id) => {
    return await movRepo.obtenerSaldoActual(cuenta_id);
};

// ========== OBTENER MOVIMIENTOS POR PERÍODO ==========

const obtenerMovimientosPorPeriodo = async (cuenta_id, inicio, fin) => {
    return await movRepo.obtenerMovimientosPorPeriodo(cuenta_id, inicio, fin);
};

// ========== OBTENER ESTADÍSTICAS ==========

const obtenerEstadisticas = async (cuenta_id, inicio, fin) => {
    return await movRepo.obtenerEstadisticas(cuenta_id, inicio, fin);
};
// Admin-contabilidad Victor
const registrarIngresoPedidoNegocio = async ({
    pedido_id,
    negocio_id,
    cliente_id,
    subtotal,
    descuento,
    comision,
    total
}) => {
    const cuenta_id = 1;

    const descripcion = `Ingreso pedido negocio #${pedido_id} - negocio ${negocio_id}`;

    const movimientoId = await movRepo.crearMovimiento({
        cuenta_id,
        tipo: 'ingreso',
        subtipo: 'pedido_negocio',
        modulo_origen: 'negocios',
        referencia_id: negocio_id,
        monto: total,
        descripcion,
        pedido_id,
        estado: 'completado'
    });

    await movRepo.actualizarSaldo(cuenta_id, total);

    return {
        ok: true,
        movimiento_id: movimientoId,
        detalle: {
            pedido_id,
            negocio_id,
            cliente_id,
            subtotal,
            descuento,
            comision,
            total
        }
    };
};

// Admin-contabilidad Victor
const registrarEgresoCancelacionNegocio = async ({
    pedido_id,
    negocio_id,
    monto,
    motivo
}) => {
    const cuenta_id = 1;

    const descripcion = motivo || `Cancelación pedido negocio #${pedido_id}`;

    const movimientoId = await movRepo.crearMovimiento({
        cuenta_id,
        tipo: 'egreso',
        subtipo: 'cancelacion_negocio',
        modulo_origen: 'negocios',
        referencia_id: negocio_id,
        monto,
        descripcion,
        pedido_id,
        estado: 'completado'
    });

    await movRepo.restarSaldo(cuenta_id, monto);

    return {
        ok: true,
        movimiento_id: movimientoId
    };
};

// Admin-contabilidad Victor
const registrarIngresoMultaCancelacionNegocio = async ({
    pedido_id,
    negocio_id,
    monto,
    motivo
}) => {
    const cuenta_id = 1;

    const descripcion = motivo || `Multa por cancelación pedido negocio #${pedido_id}`;

    const movimientoId = await movRepo.crearMovimiento({
        cuenta_id,
        tipo: 'ingreso',
        subtipo: 'multa_cancelacion_negocio',
        modulo_origen: 'negocios',
        referencia_id: negocio_id,
        monto,
        descripcion,
        pedido_id,
        estado: 'completado'
    });

    await movRepo.actualizarSaldo(cuenta_id, monto);

    return {
        ok: true,
        movimiento_id: movimientoId
    };
};

// Admin-contabilidad Kenneth
// Admin-contabilidad Emmanuel
// Admin-contabilidad Victor
module.exports = {
    crearIngreso,
    crearEgreso,

    obtenerMovimientos,
    obtenerSaldo,
    obtenerMovimientosPorPeriodo,
    obtenerEstadisticas,

    registrarIngresoPedidoNegocio,
    registrarEgresoCancelacionNegocio,
    registrarIngresoMultaCancelacionNegocio
};