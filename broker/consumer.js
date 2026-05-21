// Admin-contabilidad Kenneth

const eventos = require('../../services/admin-contabilidad/src/events');

const procesarMensaje = async (evento) => {

    console.log(' Evento recibido:', evento);

    await eventos.procesarEvento(evento);
};

module.exports = {
    procesarMensaje
};