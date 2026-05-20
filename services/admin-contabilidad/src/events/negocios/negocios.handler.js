// Admin-contabilidad Victor

const movimientoService = require('../../services/movimiento.service');
const eventoRepo = require('../../repositories/evento.repository');
const pedidoContabilidadService = require('../../services/pedidoContabilidad.service');
const entidadComercialRepo = require('../../repositories/entidadComercial.repository');

module.exports = async (evento) => {
  if (evento.tipo === 'PEDIDO_ENTREGADO') {
    const {
      pedido_id,
      negocio_id,
      cliente_id,
      subtotal,
      descuento,
      comision,
      total
    } = evento.data;

    await eventoRepo.guardarEvento({
      modulo_origen: 'negocios',
      tipo_evento: evento.tipo,
      referencia_id: pedido_id,
      payload: evento.data
    });

    await movimientoService.registrarIngresoPedidoNegocio({
      pedido_id,
      negocio_id,
      cliente_id,
      subtotal,
      descuento,
      comision,
      total
    });

    const entidadComercial = await entidadComercialRepo.obtenerPorEntidadExterna(
      negocio_id,
      'negocio'
    );

    if (!entidadComercial) {
      throw new Error(`No existe entidad_comercial activa para negocio_id externo: ${negocio_id}`);
    }

    await pedidoContabilidadService.registrarPedidoNegocio({
      entidad_comercial_id: entidadComercial.id,
      pedido_id_externo: pedido_id,
      subtotal,
      descuento,
      comision,
      total,
      estado: 'completado'
    });

    console.log(' Flujo completo negocios ejecutado');
  }

  if (evento.tipo === 'PEDIDO_CANCELADO') {
    const {
      pedido_id,
      negocio_id,
      monto_reembolso,
      motivo
    } = evento.data;

    await eventoRepo.guardarEvento({
      modulo_origen: 'negocios',
      tipo_evento: evento.tipo,
      referencia_id: pedido_id,
      payload: evento.data
    });

    await movimientoService.registrarEgresoCancelacionNegocio({
      pedido_id,
      negocio_id,
      monto: monto_reembolso,
      motivo
    });

    await pedidoContabilidadService.actualizarEstadoPedidoNegocio({
      pedido_id_externo: pedido_id,
      estado: 'cancelado'
    });

    console.log(' Flujo cancelación negocios ejecutado');
  }

  if (evento.tipo === 'PEDIDO_CANCELADO_CON_MULTA') {
    const {
      pedido_id,
      negocio_id,
      monto_reembolso,
      multa,
      motivo
    } = evento.data;

    await eventoRepo.guardarEvento({
      modulo_origen: 'negocios',
      tipo_evento: evento.tipo,
      referencia_id: pedido_id,
      payload: evento.data
    });

    await movimientoService.registrarEgresoCancelacionNegocio({
      pedido_id,
      negocio_id,
      monto: monto_reembolso,
      motivo: motivo || 'Reembolso por cancelación con multa'
    });

    await movimientoService.registrarIngresoMultaCancelacionNegocio({
      pedido_id,
      negocio_id,
      monto: multa,
      motivo: motivo || 'Multa por cancelación de pedido'
    });

    await pedidoContabilidadService.actualizarEstadoPedidoNegocio({
      pedido_id_externo: pedido_id,
      estado: 'cancelado_con_multa'
    });

    console.log(' Flujo cancelación con multa negocios ejecutado');
  }

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
      modulo_origen: 'negocios',
      tipo_evento: evento.tipo,
      referencia_id: pedido_id,
      payload: evento.data
    });

    await pedidoContabilidadService.actualizarResumenPedidoNegocio({
      pedido_id_externo: pedido_id,
      subtotal,
      descuento,
      comision,
      total,
      estado: estado || 'actualizado'
    });

    console.log(' Flujo actualización pedido negocio ejecutado');
  }
};