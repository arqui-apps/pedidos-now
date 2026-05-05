// prueba directa sin index
console.log('🔥 INICIANDO TEST');
const handler = require('./admin-contabilidad/src/events/descuentos/descuentos.handler');


const eventoPrueba = {
  tipo: 'PROMOCION_APLICADA',
  data: {
    pedido_id: 3001,
    promocion_id: 10,
    cliente_id: 5,
    monto_descuento: 15.00
  }
};

handler(eventoPrueba)
  .then(() => {
    console.log('✅ Test directo ejecutado correctamente');
  })
  .catch((error) => {
    console.error('❌ Error en test directo:', error);
  });

console.log('🔥 FIN DEL ARCHIVO');
