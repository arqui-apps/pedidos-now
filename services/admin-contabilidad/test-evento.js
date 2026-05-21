// Admin-contabilidad Kenneth

const eventos = require('./src/events');

(async () => {

    await eventos.procesarEvento({
        modulo: 'paqueteria',
        tipo: 'ENVIO_ENTREGADO',
        data: {
            pedido_id: 1,
            repartidor_id: 10,
            costo_envio: 50
        }
    });

    console.log("Evento ejecutado");

})();