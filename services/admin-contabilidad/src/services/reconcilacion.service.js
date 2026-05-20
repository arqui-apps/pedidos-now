const cobrosRepo = require('../repositories/cobros.repository');
const cobrosClient = require('../integrations/cobros-client');

const reconciliarCobrosInconsistentes = async () => {

    console.log(
        '[Reconciliacion] Buscando cobros inconsistentes...'
    );

    const inconsistentes =
        await cobrosRepo.obtenerCobros({
            estado: 'inconsistente'
        });

    console.log(
        `[Reconciliacion] ${inconsistentes.length} encontrados`
    );

    for (const cobro of inconsistentes) {

        try {

            console.log(
                `[Reconciliacion] Reintentando cobro ${cobro.id}`
            );

            const respuesta =
                await cobrosClient.procesarCobro({
                    cliente_id: cobro.cliente_id,
                    pedido_id: cobro.pedido_id,
                    monto_total: cobro.monto_total,
                    tipo_pago: cobro.tipo_pago,
                    repartidor_id: cobro.repartidor_id,
                    idempotency_key:
                        cobro.idempotency_key
                });

            await cobrosRepo.actualizarEstadoCobro(
                cobro.id,
                'completado'
            );

            console.log(
                `[Reconciliacion] Cobro ${cobro.id} reconciliado`
            );

        } catch (error) {

            console.error(
                `[Reconciliacion] Falló reconciliación ${cobro.id}:`,
                error.message
            );

            // persistir último error
            await cobrosRepo.actualizarErrorExterno(
                cobro.id,
                error.message
            );
        }
    }
};

module.exports = {
    reconciliarCobrosInconsistentes
};