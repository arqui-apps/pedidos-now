// Admin-contabilidad Kenneth

const {
  sequelize,
  EntidadComercial,
  PedidoContabilidad,
  MovimientoFinanciero
} = require('../models');

const crearOActualizarEntidadPaqueteria = async (data = {}, transaction = null) => {
  const entidadIdExterno = data.entidad_id_externo || data.paqueteria_id || 1;
  const nombreComercial = data.nombre_paqueteria || data.nombre_comercial || 'Servicio Paquetería';

  const [entidad] = await EntidadComercial.findOrCreate({
    where: {
      entidad_id_externo: entidadIdExterno,
      tipo: 'paqueteria'
    },
    defaults: {
      entidad_id_externo: entidadIdExterno,
      nombre_comercial: nombreComercial,
      tipo: 'paqueteria',
      activo: true
    },
    transaction
  });

  await entidad.update({
    nombre_comercial: nombreComercial,
    activo: true
  }, { transaction });

  return entidad;
};

const crearOModificarPedidoPaqueteria = async (data = {}, transaction = null) => {
  const shipmentId = data.shipment_id || data.pedido_id || data.pedido_id_externo || data.idShipment;

  if (!shipmentId) {
    throw new Error('shipment_id o pedido_id es requerido');
  }

  const entidad = await crearOActualizarEntidadPaqueteria(data, transaction);

  const subtotal = Number(data.subtotal || data.total || data.monto || 0);
  const descuento = Number(data.descuento || 0);
  const comision = Number(data.comision || data.tarifa_servicio || 0);
  const total = Number(data.total || data.monto || subtotal || 0);
  const estado = data.estado || data.shipmentStatus || 'completado';

  const [pedido, creado] = await PedidoContabilidad.findOrCreate({
    where: {
      pedido_id_externo: shipmentId,
      modulo_origen: 'paqueteria'
    },
    defaults: {
      entidad_comercial_id: entidad.id,
      pedido_id_externo: shipmentId,
      tipo_pedido: 'paqueteria',
      modulo_origen: 'paqueteria',
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
      tipo_pedido: 'paqueteria',
      modulo_origen: 'paqueteria',
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

const crearMovimientoPaqueteria = async (data = {}, transaction = null) => {
  const shipmentId = data.shipment_id || data.pedido_id || data.pedido_id_externo || data.idShipment;
  const monto = Number(data.monto || data.total || data.subtotal || 0);

  if (!shipmentId) {
    throw new Error('shipment_id o pedido_id es requerido');
  }

  if (!monto || monto <= 0) {
    throw new Error('monto, total o subtotal debe ser mayor a 0');
  }

  if (data.idempotency_key) {
    const existente = await MovimientoFinanciero.findOne({
      where: {
        idempotency_key: data.idempotency_key,
        modulo_origen: 'paqueteria'
      },
      transaction
    });

    if (existente) {
      return {
        movimiento: existente,
        creado: false
      };
    }
  }

  const movimiento = await MovimientoFinanciero.create({
    cuenta_id: data.cuenta_id || 1,
    tipo: data.tipo || 'ingreso',
    subtipo: data.subtipo || 'envio_paqueteria',
    modulo_origen: 'paqueteria',
    referencia_id: data.referencia_id || shipmentId,
    monto,
    descripcion: data.descripcion || `Movimiento de paquetería para envío #${shipmentId}`,
    pedido_id: shipmentId,
    repartidor_id: data.repartidor_id || data.courier_id || data.courierId || null,
    estado: data.estado || data.shipmentStatus || 'completado',
    fecha: data.fecha || new Date(),
    transaction_id_banco: data.transaction_id_banco || null,
    payment_id_cobros: data.payment_id_cobros || null,
    idempotency_key: data.idempotency_key || null
  }, { transaction });

  return {
    movimiento,
    creado: true
  };
};

const guardarEnvioContabilidadPaqueteria = async (data = {}) => {
  if (!data.shipment_id && !data.pedido_id && !data.pedido_id_externo && !data.idShipment) {
    throw new Error('shipment_id o pedido_id es requerido');
  }

  return await sequelize.transaction(async (transaction) => {
    const pedidoGuardado = await crearOModificarPedidoPaqueteria({
      ...data,
      estado: data.estado || data.shipmentStatus || 'completado'
    }, transaction);

    const movimientoGuardado = await crearMovimientoPaqueteria({
      ...data,
      tipo: 'ingreso',
      subtipo: data.subtipo || 'envio_paqueteria',
      descripcion: data.descripcion || `Ingreso por envío de paquetería #${data.shipment_id || data.pedido_id || data.idShipment}`,
      estado: data.estado || data.shipmentStatus || 'completado'
    }, transaction);

    return {
      entidad: pedidoGuardado.entidad,
      pedido: pedidoGuardado.pedido,
      pedido_creado: pedidoGuardado.creado,
      movimiento: movimientoGuardado.movimiento,
      movimiento_creado: movimientoGuardado.creado
    };
  });
};

const guardarCancelacionPaqueteria = async (data = {}) => {
  return await sequelize.transaction(async (transaction) => {
    const pedidoGuardado = await crearOModificarPedidoPaqueteria({
      ...data,
      estado: 'cancelado',
      total: data.total || data.monto_cancelacion || data.monto || 0
    }, transaction);

    const movimientoGuardado = await crearMovimientoPaqueteria({
      ...data,
      tipo: 'egreso',
      subtipo: 'cancelacion_envio',
      monto: data.monto_cancelacion || data.monto || data.total || 0,
      descripcion: data.descripcion || `Cancelación de envío de paquetería #${data.shipment_id || data.pedido_id || data.idShipment}`,
      estado: 'cancelado'
    }, transaction);

    return {
      entidad: pedidoGuardado.entidad,
      pedido: pedidoGuardado.pedido,
      pedido_creado: pedidoGuardado.creado,
      movimiento: movimientoGuardado.movimiento,
      movimiento_creado: movimientoGuardado.creado
    };
  });
};

const guardarRecargoPaqueteria = async (data = {}) => {
  return await sequelize.transaction(async (transaction) => {
    const movimientoGuardado = await crearMovimientoPaqueteria({
      ...data,
      tipo: 'ingreso',
      subtipo: 'recargo_envio',
      monto: data.monto_recargo || data.monto || data.total || 0,
      descripcion: data.descripcion || `Recargo por envío de paquetería #${data.shipment_id || data.pedido_id || data.idShipment}`,
      estado: data.estado || 'completado'
    }, transaction);

    return {
      movimiento: movimientoGuardado.movimiento,
      movimiento_creado: movimientoGuardado.creado
    };
  });
};

const obtenerResumenPaqueteria = async () => {
  const wherePedidos = {
    modulo_origen: 'paqueteria'
  };

  const totalEnvios = await PedidoContabilidad.count({ where: wherePedidos });

  const totalIngresos = await MovimientoFinanciero.sum('monto', {
    where: {
      modulo_origen: 'paqueteria',
      tipo: 'ingreso'
    }
  }) || 0;

  const totalEgresos = await MovimientoFinanciero.sum('monto', {
    where: {
      modulo_origen: 'paqueteria',
      tipo: 'egreso'
    }
  }) || 0;

  const totalRecargos = await MovimientoFinanciero.sum('monto', {
    where: {
      modulo_origen: 'paqueteria',
      subtipo: 'recargo_envio'
    }
  }) || 0;

  const enviosCancelados = await PedidoContabilidad.count({
    where: {
      modulo_origen: 'paqueteria',
      estado: 'cancelado'
    }
  });

  const enviosCompletados = await PedidoContabilidad.count({
    where: {
      modulo_origen: 'paqueteria',
      estado: ['completado', 'entregado', 'delivered', 'procesado']
    }
  });

  return {
    total_envios: totalEnvios,
    total_ingresos: Number(totalIngresos),
    total_egresos: Number(totalEgresos),
    total_recargos: Number(totalRecargos),
    envios_cancelados: enviosCancelados,
    envios_completados: enviosCompletados,
    ganancia_neta: Number(totalIngresos) - Number(totalEgresos)
  };
};

const obtenerResumenPorRepartidor = async (courierId) => {
  const whereBase = {
    modulo_origen: 'paqueteria',
    repartidor_id: courierId
  };

  const totalMovimientos = await MovimientoFinanciero.count({
    where: whereBase
  });

  const totalIngresos = await MovimientoFinanciero.sum('monto', {
    where: {
      ...whereBase,
      tipo: 'ingreso'
    }
  }) || 0;

  const totalEgresos = await MovimientoFinanciero.sum('monto', {
    where: {
      ...whereBase,
      tipo: 'egreso'
    }
  }) || 0;

  const totalRecargos = await MovimientoFinanciero.sum('monto', {
    where: {
      ...whereBase,
      subtipo: 'recargo_envio'
    }
  }) || 0;

  return {
    repartidor_id: Number(courierId),
    total_movimientos: totalMovimientos,
    total_ingresos: Number(totalIngresos),
    total_egresos: Number(totalEgresos),
    total_recargos: Number(totalRecargos),
    ganancia_neta: Number(totalIngresos) - Number(totalEgresos)
  };
};

module.exports = {
  crearOActualizarEntidadPaqueteria,
  crearOModificarPedidoPaqueteria,
  crearMovimientoPaqueteria,
  guardarEnvioContabilidadPaqueteria,
  guardarCancelacionPaqueteria,
  guardarRecargoPaqueteria,
  obtenerResumenPaqueteria,
  obtenerResumenPorRepartidor
};