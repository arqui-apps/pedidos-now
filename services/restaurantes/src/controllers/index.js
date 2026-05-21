// ============================================================
// ARCHIVO CENTRAL DE CONTROLADORES - RESTAURANTES SERVICE
// ============================================================
// Exportación unificada de todos los controladores
// ============================================================

// Restaurantes
const restauranteController = require('./restaurantes/restaurante.controller');
// Pedidos
const pedidoController           = require('./pedidos/pedido.controller');
const detallePedidoController    = require('./pedidos/detalle-pedido.controller');
const historialEstadosController = require('./pedidos/historial-estados-pedido.controller');
const cancelacionPedidoController = require('./pedidos/cancelacion-pedido.controller');
const estadoPedidoController     = require('./pedidos/estado-pedido.controller');

// ============================================================
// EXPORTAR TODOS LOS CONTROLADORES
// ============================================================

module.exports = {
  restauranteController,
  
  pedidoController,
  detallePedidoController,
  historialEstadosController,
  cancelacionPedidoController,
  estadoPedidoController
};
