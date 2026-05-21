const repo = require('../repositories/movimiento.repository');

const registrarIngresoPedido = async (data) => {
    const cuenta_id = 1; //fondo principal

    const movimientoId = await repo.crearMovimiento({
        cuenta_id, 
        referencia_id: data.pedido_id,
        monto: data.monto,
        descripcion: data.descripcion
    });

    await repo.actualizarSaldo(cuenta_id, data.monto);

    return {
        ok: true,
        movimiento_id: movimientoId
    };
};

const registrarEgreso = async (data) => {
    const cuenta_id = 1;

    const movimientoId = await repo.crearEgreso({
        cuenta_id,
        subtipo: data.tipo, //salario, reembolso, compensación
        referencia_id: data.empleado_id,
        monto: data.monto,
        descripcion: data.descripcion
    });
    await repo.restarSaldo(cuenta_id, data.monto);

    return {
        ok: true,
        movimiento_id: movimientoId
    };
};

// Admin-contabilidad Kenneth

const registrarEgresoEnvio = async ({ pedido_id, repartidor_id, costo_envio }) => {
  return await repo.crearMovimiento({
    tipo: 'egreso',
    subtipo: 'envio',
    modulo_origen: 'paqueteria',
    monto: costo_envio,
    descripcion: 'Pago a repartidor',
    pedido_id,
    repartidor_id,
    estado: 'completado'
  });
};

const registrarIngresoEnvio = async ({ pedido_id, monto }) => {
  return await repo.crearMovimiento({
    tipo: 'ingreso',
    subtipo: 'envio',
    modulo_origen: 'paqueteria',
    monto,
    descripcion: 'Cobro por envío',
    pedido_id,
    estado: 'pendiente'
  });
};
// Admin-contabilidad Emmanuel
const registrarEgresoCancelacionRestaurante = async ({
    pedido_id,
    restaurante_id,
    monto,
    motivo
}) => {
    const cuenta_id = 1;

    const descripcion = motivo || `Cancelación pedido restaurante #${pedido_id}`;

    const movimientoId = await repo.crearMovimiento({
        cuenta_id,
        tipo: 'egreso',
        subtipo: 'cancelacion_restaurante',
        modulo_origen: 'restaurantes',
        referencia_id: restaurante_id,
        monto,
        descripcion,
        pedido_id,
        estado: 'completado'
    });

    await repo.restarSaldo(cuenta_id, monto);

    return {
        ok: true,
        movimiento_id: movimientoId
    };
};

const obtenerFondos = async () => {
    return await repo.getFondos();
};

// Admin-contabilidad Emmanuel
const registrarIngresoPedidoRestaurante = async ({
    pedido_id,
    restaurante_id,
    cliente_id,
    subtotal,
    descuento,
    comision,
    total
}) => {
    const cuenta_id = 1;

    const descripcion = `Ingreso pedido restaurante #${pedido_id} - restaurante ${restaurante_id}`;

    const movimientoId = await repo.crearMovimiento({
        cuenta_id,
        tipo: 'ingreso',
        subtipo: 'pedido_restaurante',
        modulo_origen: 'restaurantes',
        referencia_id: restaurante_id,
        monto: total,
        descripcion,
        pedido_id,
        estado: 'completado'
    });

    await repo.actualizarSaldo(cuenta_id, total);

    return {
        ok: true,
        movimiento_id: movimientoId,
        detalle: {
            pedido_id,
            restaurante_id,
            cliente_id,
            subtotal,
            descuento,
            comision,
            total
        }
    };
};
// Admin-contabilidad Emmanuel
const registrarIngresoMultaCancelacionRestaurante = async ({
    pedido_id,
    restaurante_id,
    monto,
    motivo
}) => {
    const cuenta_id = 1;

    const descripcion = motivo || `Multa por cancelación pedido restaurante #${pedido_id}`;

    const movimientoId = await repo.crearMovimiento({
        cuenta_id,
        tipo: 'ingreso',
        subtipo: 'multa_cancelacion_restaurante',
        modulo_origen: 'restaurantes',
        referencia_id: restaurante_id,
        monto,
        descripcion,
        pedido_id,
        estado: 'completado'
    });

    await repo.actualizarSaldo(cuenta_id, monto);

    return {
        ok: true,
        movimiento_id: movimientoId
    };
};

// Admin-contabilidad Kenneth
// Admin-contabilidad Emmanuel
module.exports = {
    registrarIngresoPedido,
    registrarEgreso,
    registrarEgresoEnvio,
    registrarIngresoEnvio,
    registrarEgresoCancelacionRestaurante,
    registrarIngresoMultaCancelacionRestaurante,
    registrarIngresoPedidoRestaurante,
    obtenerFondos
};

