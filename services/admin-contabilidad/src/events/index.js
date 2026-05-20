// Admin-contabilidad Kenneth
const paqueteriaHandler = require('./paqueteria/paqueteria.handler');
// Admin-contabilidad Emmanuel
const restaurantesHandler = require('./restaurantes/restaurantes.handler');
// Admin-contabilidad Victor
const negociosHandler = require('./negocios/negocios.handler');


exports.procesarEvento = async (evento) => {
  try {
    switch (evento.modulo) {
      // Admin-contabilidad Kenneth
      case 'paqueteria':
        await paqueteriaHandler(evento);
        break;
      // Admin-contabilidad Emmanuel
      case 'restaurantes':
        await restaurantesHandler(evento);
        break;

       // Admin-contabilidad Victor
      case 'negocios':
        await negociosHandler(evento);
        break;
      default:
        console.log(' Evento no manejado:', evento.tipo);
    }
  } catch (error) {
    console.error(' Error procesando evento:', error);
  }
};