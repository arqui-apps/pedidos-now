//Admin-Conta Jeff. Daniel Ramos
const movimientoService = require('../../services/movimiento.service');
const eventoRepo = require('../../repositories/evento.repository');

module.exports = async (evento) => {

  if (evento.tipo === 'PROMOCION_APLICADA') {
    const {
      pedido_id,
      promocion_id,
      cliente_id,
      monto_descuento
    } = evento.data;

    // guardar evento
    await eventoRepo.guardarEvento({
      modulo_origen: 'promociones',
      tipo_evento: evento.tipo,
      referencia_id: pedido_id,
      payload: evento.data
    });

    // registrar egreso (descuento aplicado)
    await movimientoService.registrarEgreso({
      tipo: 'descuento_promocion',
      empleado_id: cliente_id, // lo usamos como referencia
      monto: monto_descuento,
      descripcion: `Descuento aplicado promo #${promocion_id} en pedido ${pedido_id}`
    });

    console.log(' Flujo promoción aplicada ejecutado');
  }

  if (evento.tipo === 'PROMOCION_CANCELADA') {
    const {
      pedido_id,
      promocion_id,
      monto_descuento
    } = evento.data;

    await eventoRepo.guardarEvento({
      modulo_origen: 'promociones',
      tipo_evento: evento.tipo,
      referencia_id: pedido_id,
      payload: evento.data
    });

    // reversión del descuento (ingreso)
    await movimientoService.registrarIngresoPedido({
      pedido_id,
      monto: monto_descuento,
      descripcion: `Reversión descuento promo #${promocion_id}`
    });

    console.log(' Flujo cancelación promoción ejecutado');
  }
};
