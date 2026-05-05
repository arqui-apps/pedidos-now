//Admin-conta Jeff. Daniel Ramos
const eventos = require('./src/events');

const eventoPrueba = {
  modulo: 'descuentos',
  tipo: 'PROMOCION_APLICADA',
  data: {
    pedido_id: 3001,
    promocion_id: 10,
    cliente_id: 5,
    monto_descuento: 15.00
  }
};

eventos.procesarEvento(eventoPrueba)
  .then(() => {
    console.log(' Evento de promociones procesado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error(' Error probando evento:', error);
    process.exit(1);
  });
