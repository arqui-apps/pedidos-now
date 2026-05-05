//Admin-conta Jeff. Daniel Ramos
const eventos = require('./src/events');

const eventoPrueba = {
  modulo: 'descuentos',
  tipo: 'PROMOCION_APLICADA',
  data: {
    pedido_id: 3001,
    cliente_id: 5,
    promociones: [
      {
        promocion_id: 10,
        tipo_alcance: 'PRODUCTO',
        referencia_id: 108,
        monto_descuento: 15.00
      }
    ]
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
