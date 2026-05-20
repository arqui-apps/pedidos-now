// Admin-contabilidad Victor

const eventos = require('./src/events');

const eventoPrueba = {
  modulo: 'negocios',
  tipo: 'PEDIDO_ENTREGADO',
  data: {
    pedido_id: 2001,
    negocio_id: 501,
    cliente_id: 99,
    subtotal: 150.00,
    descuento: 10.00,
    comision: 5.00,
    total: 145.00
  }
};

eventos.procesarEvento(eventoPrueba)
  .then(() => {
    console.log(' Evento de negocios procesado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error(' Error probando evento de negocios:', error);
    process.exit(1);
  });