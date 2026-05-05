// Admin-contabilidad Jeff
const descuentosHandler = require('./descuentos/descuentos.handler');

exports.procesarEvento = async (evento) => {
  try {
    switch (evento.modulo) {
      case 'descuentos':
        await descuentosHandler(evento);
        break;

      default:
        console.log('Evento no manejado:', evento.tipo);
    }
  } catch (error) {
    console.error('Error procesando evento:', error);
  }
};
