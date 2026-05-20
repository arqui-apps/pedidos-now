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
    estado,
    'restaurantes'
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
    estado,
    modulo_origen: 'restaurantes'
  });
};

// Admin-contabilidad Victor
const registrarPedidoNegocio = async ({
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
    tipo_pedido: 'negocio',
    modulo_origen: 'negocios',
    subtotal,
    descuento,
    comision,
    total,
    estado
  });
};

// Admin-contabilidad Victor
const actualizarEstadoPedidoNegocio = async ({
  pedido_id_externo,
  estado
}) => {
  return await pedidoContabilidadRepo.actualizarEstadoPedidoContabilidad(
    pedido_id_externo,
    estado,
    'negocios'
  );
};

// Admin-contabilidad Victor
const actualizarResumenPedidoNegocio = async ({
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
    estado,
    modulo_origen: 'negocios'
  });
};



module.exports = {
  registrarPedidoRestaurante,
  actualizarEstadoPedidoRestaurante,
  actualizarResumenPedidoRestaurante,
  registrarPedidoNegocio,
  actualizarEstadoPedidoNegocio,
  actualizarResumenPedidoNegocio
};