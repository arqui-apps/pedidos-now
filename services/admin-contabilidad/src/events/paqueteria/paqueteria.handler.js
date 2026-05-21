// Admin-contabilidad Kenneth

const movimientoService = require('../../services/movimiento.service');
const eventoRepo = require('../../repositories/evento.repository');

// Admin-contabilidad Kenneth
const path = require('path');

const producer = require(
  path.resolve(__dirname, '../../../../../broker/producer')
);



module.exports = async (evento) => {

    if (evento.tipo === 'ENVIO_ENTREGADO') {

        const { pedido_id, repartidor_id, costo_envio } = evento.data;

        // 1. Guardar evento
        await eventoRepo.guardarEvento({
            modulo_origen: 'paqueteria',
            tipo_evento: evento.tipo,
            referencia_id: pedido_id,
            payload: evento.data
        });

        // 2. Registrar EGRESO
        await movimientoService.registrarEgresoEnvio({
            pedido_id,
            repartidor_id,
            costo_envio
        });

        // 3. Registrar INGRESO
        await movimientoService.registrarIngresoEnvio({
            pedido_id,
            monto: costo_envio
        });

        // 4. Enviar a cobros
        await producer.enviarEvento({
            modulo: "restaurantes",
            tipo: "PROCESAR_ENVIO",
            data: {
                pedido_id,
                monto: costo_envio,
                origen: "paqueteria"
            }
        });

        console.log(' Flujo completo paquetería ejecutado');
    }
};