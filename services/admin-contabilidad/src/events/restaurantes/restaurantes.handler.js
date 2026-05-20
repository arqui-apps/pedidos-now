// Admin-contabilidad Emmanuel

const movimientoService = require('../../services/movimiento.service');
const eventoRepo = require('../../repositories/evento.repository');
const pedidoContabilidadService = require('../../services/pedidoContabilidad.service');
const entidadComercialRepo = require('../../repositories/entidadComercial.repository');

module.exports = async (evento) => {
  if (evento.tipo === 'PEDIDO_ENTREGADO') {
    const {
      pedido_id,
      restaurante_id,
      cliente_id,
      subtotal,
      descuento,
      comision,
      total
    } = evento.data;

    // Guardar evento recibido
    await eventoRepo.guardarEvento({
      modulo_origen: 'restaurantes',
      tipo_evento: evento.tipo,
      referencia_id: pedido_id,
      payload: evento.data
    });

    // Registrar ingreso financiero del pedido del restaurante
    await movimientoService.registrarIngresoPedidoRestaurante({
      pedido_id,
      restaurante_id,
      cliente_id,
      subtotal,
      descuento,
      comision,
      total
    });


    const entidadComercial = await entidadComercialRepo.obtenerPorEntidadExterna(
        restaurante_id,
        'restaurante'
    );

    if (!entidadComercial) {
    throw new Error(`No existe entidad_comercial activa para restaurante_id externo: ${restaurante_id}`);
    }
    

    await pedidoContabilidadService.registrarPedidoRestaurante({
        entidad_comercial_id: entidadComercial.id,
        pedido_id_externo: pedido_id,
        subtotal,
        descuento,
        comision,
        total,
        estado: 'completado'
    });

    console.log(' Flujo completo restaurantes ejecutado');
  }
  if (evento.tipo === 'PEDIDO_CANCELADO') {
    const {
      pedido_id,
      restaurante_id,
      monto_reembolso,
      motivo
    } = evento.data;

    await eventoRepo.guardarEvento({
      modulo_origen: 'restaurantes',
      tipo_evento: evento.tipo,
      referencia_id: pedido_id,
      payload: evento.data
    });

    await movimientoService.registrarEgresoCancelacionRestaurante({
      pedido_id,
      restaurante_id,
      monto: monto_reembolso,
      motivo
    });

    await pedidoContabilidadService.actualizarEstadoPedidoRestaurante({
      pedido_id_externo: pedido_id,
      estado: 'cancelado'
    });

    console.log(' Flujo cancelación restaurantes ejecutado');
  }
    // Admin-contabilidad Emmanuel
  if (evento.tipo === 'PEDIDO_CANCELADO_CON_MULTA') {
    const {
      pedido_id,
      restaurante_id,
      monto_reembolso,
      multa,
      motivo
    } = evento.data;

    await eventoRepo.guardarEvento({
      modulo_origen: 'restaurantes',
      tipo_evento: evento.tipo,
      referencia_id: pedido_id,
      payload: evento.data
    });

    await movimientoService.registrarEgresoCancelacionRestaurante({
      pedido_id,
      restaurante_id,
      monto: monto_reembolso,
      motivo: motivo || 'Reembolso por cancelación con multa'
    });

    await movimientoService.registrarIngresoMultaCancelacionRestaurante({
      pedido_id,
      restaurante_id,
      monto: multa,
      motivo: motivo || 'Multa por cancelación de pedido'
    });

    await pedidoContabilidadService.actualizarEstadoPedidoRestaurante({
      pedido_id_externo: pedido_id,
      estado: 'cancelado_con_multa'
    });
  
    console.log(' Flujo cancelación con multa restaurantes ejecutado');
  }
    // Admin-contabilidad Emmanuel
  if (evento.tipo === 'PEDIDO_ACTUALIZADO') {
    const {
      pedido_id,
      subtotal,
      descuento,
      comision,
      total,
      estado
    } = evento.data;

    await eventoRepo.guardarEvento({
      modulo_origen: 'restaurantes',
      tipo_evento: evento.tipo,
      referencia_id: pedido_id,
      payload: evento.data
    });

    await pedidoContabilidadService.actualizarResumenPedidoRestaurante({
      pedido_id_externo: pedido_id,
      subtotal,
      descuento,
      comision,
      total,
      estado: estado || 'actualizado'
    });

    console.log(' Flujo actualización pedido restaurante ejecutado');
  }
};


//[prueba conexion Victor de leon ]