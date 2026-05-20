// Admin-contabilidad Victor

const {
    sequelize,
    EntidadComercial,
    PedidoContabilidad,
    MovimientoFinanciero
} = require('../models');

const buscarEntidadNegocioPorExterno = async (entidadIdExterno) => {
    return await EntidadComercial.findOne({
        where: {
            entidad_id_externo: entidadIdExterno,
            tipo: 'negocio'
        }
    });
};

const crearOActualizarEntidadNegocio = async (data, transaction = null) => {
    const entidadIdExterno = data.entidad_id_externo || data.business_id || data.businessId;
    const nombreComercial = data.nombre_comercial || data.business_name || data.tradeName || data.nombre || 'Negocio sin nombre';
    const activo = data.activo !== undefined ? data.activo : true;

    if (!entidadIdExterno) {
        throw new Error('business_id o entidad_id_externo es requerido');
    }

    const [entidad] = await EntidadComercial.findOrCreate({
        where: {
            entidad_id_externo: entidadIdExterno,
            tipo: 'negocio'
        },
        defaults: {
            entidad_id_externo: entidadIdExterno,
            nombre_comercial: nombreComercial,
            tipo: 'negocio',
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

const guardarPedidoContabilidadNegocio = async (data, transaction = null) => {
    const entidadIdExterno = data.entidad_id_externo || data.business_id || data.businessId;
    const pedidoIdExterno = data.pedido_id_externo || data.pedido_id || data.orderId;
    const nombreComercial = data.nombre_comercial || data.business_name || data.tradeName || 'Negocio sin nombre';

    if (!entidadIdExterno) {
        throw new Error('business_id o entidad_id_externo es requerido');
    }

    if (!pedidoIdExterno) {
        throw new Error('pedido_id o pedido_id_externo es requerido');
    }

    const entidad = await crearOActualizarEntidadNegocio({
        entidad_id_externo: entidadIdExterno,
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
            modulo_origen: 'negocios'
        },
        defaults: {
            entidad_comercial_id: entidad.id,
            pedido_id_externo: pedidoIdExterno,
            tipo_pedido: 'negocio',
            modulo_origen: 'negocios',
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
            tipo_pedido: 'negocio',
            modulo_origen: 'negocios',
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

const crearMovimientoFinancieroNegocio = async (data, transaction = null) => {
    const monto = Number(data.monto || data.total || 0);

    if (!monto || monto <= 0) {
        throw new Error('monto o total debe ser mayor a 0');
    }

    const movimiento = await MovimientoFinanciero.create({
        cuenta_id: data.cuenta_id || 1,
        tipo: data.tipo || 'ingreso',
        subtipo: data.subtipo || 'pedido_negocio',
        modulo_origen: 'negocios',
        referencia_id: data.referencia_id || data.entidad_comercial_id || data.business_id || null,
        monto,
        descripcion: data.descripcion || `Ingreso por pedido de negocio #${data.pedido_id || data.pedido_id_externo || ''}`,
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

const guardarPedidoYMovimientoNegocio = async (data) => {
    return await sequelize.transaction(async (transaction) => {
        const guardado = await guardarPedidoContabilidadNegocio(data, transaction);

        const movimiento = await crearMovimientoFinancieroNegocio({
            cuenta_id: data.cuenta_id || 1,
            tipo: data.tipo || 'ingreso',
            subtipo: data.subtipo || 'pedido_negocio',
            referencia_id: guardado.entidad.id,
            entidad_comercial_id: guardado.entidad.id,
            business_id: data.business_id || data.entidad_id_externo,
            monto: data.monto || data.total,
            descripcion: data.descripcion || `Ingreso por pedido de negocio #${data.pedido_id || data.pedido_id_externo}`,
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

const obtenerResumenNegocios = async () => {
    const where = {
        modulo_origen: 'negocios'
    };

    const totalPedidos = await PedidoContabilidad.count({ where });

    const totalVentas = await PedidoContabilidad.sum('total', { where }) || 0;
    const totalDescuentos = await PedidoContabilidad.sum('descuento', { where }) || 0;
    const totalComisiones = await PedidoContabilidad.sum('comision', { where }) || 0;

    const pedidosCancelados = await PedidoContabilidad.count({
        where: {
            modulo_origen: 'negocios',
            estado: 'cancelado'
        }
    });

    const pedidosCompletados = await PedidoContabilidad.count({
        where: {
            modulo_origen: 'negocios',
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

const obtenerResumenNegocioPorEntidad = async (entidadIdExterno) => {
    const entidad = await buscarEntidadNegocioPorExterno(entidadIdExterno);

    if (!entidad) {
        return null;
    }

    const where = {
        modulo_origen: 'negocios',
        entidad_comercial_id: entidad.id
    };

    const totalPedidos = await PedidoContabilidad.count({ where });

    const totalVentas = await PedidoContabilidad.sum('total', { where }) || 0;
    const totalDescuentos = await PedidoContabilidad.sum('descuento', { where }) || 0;
    const totalComisiones = await PedidoContabilidad.sum('comision', { where }) || 0;

    const pedidosCancelados = await PedidoContabilidad.count({
        where: {
            modulo_origen: 'negocios',
            entidad_comercial_id: entidad.id,
            estado: 'cancelado'
        }
    });

    const pedidosCompletados = await PedidoContabilidad.count({
        where: {
            modulo_origen: 'negocios',
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
    buscarEntidadNegocioPorExterno,
    crearOActualizarEntidadNegocio,
    guardarPedidoContabilidadNegocio,
    crearMovimientoFinancieroNegocio,
    guardarPedidoYMovimientoNegocio,
    obtenerResumenNegocios,
    obtenerResumenNegocioPorEntidad
};