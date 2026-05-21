// Admin-contabilidad Emmanuel

const pedidoContabilidadRepo = require('../repositories/pedidoContabilidad.repository');

const registrarPedidoRestaurante = async ({
  entidad_comercial_id,
  pedido_id_externo,
  subtotal,
  descuento,
  comision,
  total,
  estado = 'completado'
}) => {
  return await pedidoContabilidadRepo.crearPedidoContabilidad({
    entidad_comercial_id,
    pedido_id_externo,
    tipo_pedido: 'restaurante',
    modulo_origen: 'restaurantes',
    subtotal,
    descuento,
    comision,
    total,
    estado
  });
};
 
const actualizarEstadoPedidoRestaurante = async ({
  pedido_id_externo,
  estado
}) => {
  return await pedidoContabilidadRepo.actualizarEstadoPedidoContabilidad(
    pedido_id_externo,
    estado
  );
};


// Admin-contabilidad Emmanuel
const actualizarResumenPedidoRestaurante = async ({
  pedido_id_externo,
  subtotal,
  descuento,
  comision,
  total,
  estado = 'actualizado'
}) => {
  return await pedidoContabilidadRepo.actualizarResumenPedidoContabilidad({
    pedido_id_externo,
    subtotal,
    descuento,
    comision,
    total,
    estado
  });
};


module.exports = {
  registrarPedidoRestaurante,
  actualizarEstadoPedidoRestaurante,
  actualizarResumenPedidoRestaurante
};