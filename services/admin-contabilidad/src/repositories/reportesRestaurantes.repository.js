// Admin-contabilidad Emmanuel

const {
    sequelize,
    EntidadComercial,
    PedidoContabilidad,
    MovimientoFinanciero
} = require('../models');

const buscarEntidadRestaurantePorExterno = async (restauranteIdExterno) => {
    return await EntidadComercial.findOne({
        where: {
            entidad_id_externo: restauranteIdExterno,
            tipo: 'restaurante'
        }
    });
};

const crearOActualizarEntidadRestaurante = async (data, transaction = null) => {
    const restauranteIdExterno = data.restaurante_id || data.restauranteId || data.entidad_id_externo;
    const nombreComercial = data.nombre_restaurante || data.nombre_comercial || data.restaurant_name || data.nombre || 'Restaurante sin nombre';
    const activo = data.activo !== undefined ? data.activo : true;

    if (!restauranteIdExterno) {
        throw new Error('restaurante_id o entidad_id_externo es requerido');
    }

    const [entidad] = await EntidadComercial.findOrCreate({
        where: {
            entidad_id_externo: restauranteIdExterno,
            tipo: 'restaurante'
        },
        defaults: {
            entidad_id_externo: restauranteIdExterno,
            nombre_comercial: nombreComercial,
            tipo: 'restaurante',
            activo
        },
        transaction
    });

    await entidad.update({
        nombre_comercial: nombreComercial,
        activo
    }, { transaction });

    return entidad;
};

const guardarPedidoContabilidadRestaurante = async (data, transaction = null) => {
    const restauranteIdExterno = data.restaurante_id || data.restauranteId || data.entidad_id_externo;
    const pedidoIdExterno = data.pedido_id || data.pedido_id_externo || data.orderId;
    const nombreComercial = data.nombre_restaurante || data.nombre_comercial || data.restaurant_name || 'Restaurante sin nombre';

    if (!restauranteIdExterno) {
        throw new Error('restaurante_id o entidad_id_externo es requerido');
    }

    if (!pedidoIdExterno) {
        throw new Error('pedido_id o pedido_id_externo es requerido');
    }

    const entidad = await crearOActualizarEntidadRestaurante({
        entidad_id_externo: restauranteIdExterno,
        nombre_comercial: nombreComercial,
        activo: data.activo !== undefined ? data.activo : true
    }, transaction);

    const subtotal = Number(data.subtotal || 0);
    const descuento = Number(data.descuento || 0);
    const comision = Number(data.comision || 0);
    const total = Number(data.total || data.monto || 0);
    const estado = data.estado || 'completado';

    const [pedido, creado] = await PedidoContabilidad.findOrCreate({
        where: {
            pedido_id_externo: pedidoIdExterno,
            modulo_origen: 'restaurantes'
        },
        defaults: {
            entidad_comercial_id: entidad.id,
            pedido_id_externo: pedidoIdExterno,
            tipo_pedido: 'restaurante',
            modulo_origen: 'restaurantes',
            subtotal,
            descuento,
            comision,
            total,
            estado,
            fecha: data.fecha || new Date()
        },
        transaction
    });

    if (!creado) {
        await pedido.update({
            entidad_comercial_id: entidad.id,
            tipo_pedido: 'restaurante',
            modulo_origen: 'restaurantes',
            subtotal,
            descuento,
            comision,
            total,
            estado,
            fecha: data.fecha || pedido.fecha
        }, { transaction });
    }

    return {
        entidad,
        pedido,
        creado
    };
};

const crearMovimientoFinancieroRestaurante = async (data, transaction = null) => {
    const monto = Number(data.monto || data.total || 0);

    if (!monto || monto <= 0) {
        throw new Error('monto o total debe ser mayor a 0');
    }

    const movimiento = await MovimientoFinanciero.create({
        cuenta_id: data.cuenta_id || 1,
        tipo: data.tipo || 'ingreso',
        subtipo: data.subtipo || 'pedido_restaurante',
        modulo_origen: 'restaurantes',
        referencia_id: data.referencia_id || data.entidad_comercial_id || data.restaurante_id || null,
        monto,
        descripcion: data.descripcion || `Ingreso por pedido de restaurante #${data.pedido_id || data.pedido_id_externo || ''}`,
        pedido_id: data.pedido_id || data.pedido_id_externo || null,
        repartidor_id: data.repartidor_id || null,
        estado: data.estado || 'completado',
        fecha: data.fecha || new Date(),
        transaction_id_banco: data.transaction_id_banco || null,
        payment_id_cobros: data.payment_id_cobros || null,
        idempotency_key: data.idempotency_key || null
    }, { transaction });

    return movimiento;
};

const guardarPedidoYMovimientoRestaurante = async (data) => {
    return await sequelize.transaction(async (transaction) => {
        const guardado = await guardarPedidoContabilidadRestaurante(data, transaction);

        const movimiento = await crearMovimientoFinancieroRestaurante({
            cuenta_id: data.cuenta_id || 1,
            tipo: data.tipo || 'ingreso',
            subtipo: data.subtipo || 'pedido_restaurante',
            referencia_id: guardado.entidad.id,
            entidad_comercial_id: guardado.entidad.id,
            restaurante_id: data.restaurante_id || data.entidad_id_externo,
            monto: data.monto || data.total,
            descripcion: data.descripcion || `Ingreso por pedido de restaurante #${data.pedido_id || data.pedido_id_externo}`,
            pedido_id: data.pedido_id || data.pedido_id_externo,
            repartidor_id: data.repartidor_id || null,
            estado: data.estado || 'completado',
            fecha: data.fecha || null,
            transaction_id_banco: data.transaction_id_banco || null,
            payment_id_cobros: data.payment_id_cobros || null,
            idempotency_key: data.idempotency_key || null
        }, transaction);

        return {
            entidad: guardado.entidad,
            pedido: guardado.pedido,
            movimiento,
            pedido_creado: guardado.creado
        };
    });
};

const registrarCancelacionRestaurante = async (data) => {
    return await sequelize.transaction(async (transaction) => {
        const guardado = await guardarPedidoContabilidadRestaurante({
            ...data,
            estado: data.estado || 'cancelado',
            total: data.total || data.monto || 0
        }, transaction);

        const movimientoCancelacion = await crearMovimientoFinancieroRestaurante({
            cuenta_id: data.cuenta_id || 1,
            tipo: 'egreso',
            subtipo: 'cancelacion_restaurante',
            referencia_id: guardado.entidad.id,
            entidad_comercial_id: guardado.entidad.id,
            restaurante_id: data.restaurante_id,
            monto: data.monto_cancelacion || data.monto || data.total || 0,
            descripcion: data.descripcion || `Cancelación de pedido restaurante #${data.pedido_id || data.pedido_id_externo}`,
            pedido_id: data.pedido_id || data.pedido_id_externo,
            repartidor_id: data.repartidor_id || null,
            estado: data.estado || 'cancelado',
            fecha: data.fecha || null,
            transaction_id_banco: data.transaction_id_banco || null,
            payment_id_cobros: data.payment_id_cobros || null,
            idempotency_key: data.idempotency_key || null
        }, transaction);

        let movimientoMulta = null;

        const multa = Number(data.multa_cancelacion || data.multa || 0);

        if (multa > 0) {
            movimientoMulta = await crearMovimientoFinancieroRestaurante({
                cuenta_id: data.cuenta_id || 1,
                tipo: 'ingreso',
                subtipo: 'multa_cancelacion_restaurante',
                referencia_id: guardado.entidad.id,
                entidad_comercial_id: guardado.entidad.id,
                restaurante_id: data.restaurante_id,
                monto: multa,
                descripcion: data.descripcion_multa || `Multa por cancelación de restaurante pedido #${data.pedido_id || data.pedido_id_externo}`,
                pedido_id: data.pedido_id || data.pedido_id_externo,
                repartidor_id: data.repartidor_id || null,
                estado: 'completado',
                fecha: data.fecha || null,
                transaction_id_banco: data.transaction_id_banco || null,
                payment_id_cobros: data.payment_id_cobros || null,
                idempotency_key: data.idempotency_key ? `${data.idempotency_key}-multa` : null
            }, transaction);
        }

        return {
            entidad: guardado.entidad,
            pedido: guardado.pedido,
            movimiento_cancelacion: movimientoCancelacion,
            movimiento_multa: movimientoMulta,
            pedido_creado: guardado.creado
        };
    });
};

const obtenerResumenRestaurantes = async () => {
    const where = {
        modulo_origen: 'restaurantes'
    };

    const totalPedidos = await PedidoContabilidad.count({ where });
    const totalVentas = await PedidoContabilidad.sum('total', { where }) || 0;
    const totalDescuentos = await PedidoContabilidad.sum('descuento', { where }) || 0;
    const totalComisiones = await PedidoContabilidad.sum('comision', { where }) || 0;

    const pedidosCancelados = await PedidoContabilidad.count({
        where: {
            modulo_origen: 'restaurantes',
            estado: 'cancelado'
        }
    });

    const pedidosCompletados = await PedidoContabilidad.count({
        where: {
            modulo_origen: 'restaurantes',
            estado: ['completado', 'procesado', 'actualizado']
        }
    });

    return {
        total_pedidos: totalPedidos,
        total_ventas: Number(totalVentas),
        total_descuentos: Number(totalDescuentos),
        total_comisiones: Number(totalComisiones),
        pedidos_cancelados: pedidosCancelados,
        pedidos_completados: pedidosCompletados,
        ganancia_neta: Number(totalVentas) - Number(totalDescuentos)
    };
};

const obtenerResumenRestaurantePorEntidad = async (restauranteIdExterno) => {
    const entidad = await buscarEntidadRestaurantePorExterno(restauranteIdExterno);

    if (!entidad) {
        return null;
    }

    const where = {
        modulo_origen: 'restaurantes',
        entidad_comercial_id: entidad.id
    };

    const totalPedidos = await PedidoContabilidad.count({ where });
    const totalVentas = await PedidoContabilidad.sum('total', { where }) || 0;
    const totalDescuentos = await PedidoContabilidad.sum('descuento', { where }) || 0;
    const totalComisiones = await PedidoContabilidad.sum('comision', { where }) || 0;

    const pedidosCancelados = await PedidoContabilidad.count({
        where: {
            modulo_origen: 'restaurantes',
            entidad_comercial_id: entidad.id,
            estado: 'cancelado'
        }
    });

    const pedidosCompletados = await PedidoContabilidad.count({
        where: {
            modulo_origen: 'restaurantes',
            entidad_comercial_id: entidad.id,
            estado: ['completado', 'procesado', 'actualizado']
        }
    });

    return {
        entidad_comercial_id: entidad.id,
        entidad_id_externo: entidad.entidad_id_externo,
        nombre_comercial: entidad.nombre_comercial,
        tipo: entidad.tipo,
        total_pedidos: totalPedidos,
        total_ventas: Number(totalVentas),
        total_descuentos: Number(totalDescuentos),
        total_comisiones: Number(totalComisiones),
        pedidos_cancelados: pedidosCancelados,
        pedidos_completados: pedidosCompletados,
        ganancia_neta: Number(totalVentas) - Number(totalDescuentos)
    };
};

module.exports = {
    buscarEntidadRestaurantePorExterno,
    crearOActualizarEntidadRestaurante,
    guardarPedidoContabilidadRestaurante,
    crearMovimientoFinancieroRestaurante,
    guardarPedidoYMovimientoRestaurante,
    registrarCancelacionRestaurante,
    obtenerResumenRestaurantes,
    obtenerResumenRestaurantePorEntidad
};