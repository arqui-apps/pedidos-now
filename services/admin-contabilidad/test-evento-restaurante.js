// Admin-contabilidad Emmanuel

const { procesarEvento } = require('./src/events');

const evento = {
  modulo: 'restaurantes',
  tipo: 'PEDIDO_ACTUALIZADO',
  data: {
    pedido_id: 101,
    subtotal: 85,
    descuento: 12,
    comision: 8,
    total: 73,
    estado: 'actualizado'
  }
};

procesarEvento(evento);

// Admin-contabilidad Emmanuel

// const { procesarEvento } = require('./src/events');

// const evento = {
//   modulo: 'restaurantes',
//   tipo: 'PEDIDO_CANCELADO_CON_MULTA',
//   data: {
//     pedido_id: 101,
//     restaurante_id: 5,
//     monto_reembolso: 20,
//     multa: 8,
//     motivo: 'Cancelación tardía del pedido'
//   }
// };

// procesarEvento(evento);



// // Admin-contabilidad Emmanuel

// const { procesarEvento } = require('./src/events');

// const evento = {
//   modulo: 'restaurantes',
//   tipo: 'PEDIDO_ENTREGADO',
//   data: {
//     pedido_id: 101,
//     restaurante_id: 5,
//     cliente_id: 8,
//     subtotal: 80,
//     descuento: 10,
//     comision: 8,
//     total: 78
//   }
// };

// procesarEvento(evento);

// // Admin-contabilidad Emmanuel

// const { procesarEvento } = require('./src/events');

// const evento = {
//   modulo: 'restaurantes',
//   tipo: 'PEDIDO_CANCELADO',
//   data: {
//     pedido_id: 101,
//     restaurante_id: 5,
//     monto_reembolso: 20,
//     motivo: 'Cancelación del pedido por solicitud del restaurante'
//   }
// };

// procesarEvento(evento);
