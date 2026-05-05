// Admin-contabilidad Kenneth
const paqueteriaHandler = require('./paqueteria/paqueteria.handler');
// Admin-contabilidad Emmanuel
const restaurantesHandler = require('./restaurantes/restaurantes.handler');
// Admin-contabilidad Jeff. Daniel Ramos
const descuentosHandler = require('./descuentos/descuentos.handler');


exports.procesarEvento = async (evento) => {
  try {
    switch (evento.modulo) {
      case 'paqueteria':
        await paqueteriaHandler(evento);
        break;

      case 'restaurantes':
        await restaurantesHandler(evento);
        break;

      case 'descuentos':
        await descuentosHandler(evento);
        break;

      default:
        console.log(' Evento no manejado:', evento.tipo);
    }
  } catch (error) {
    console.error(' Error procesando evento:', error);
  }
};
