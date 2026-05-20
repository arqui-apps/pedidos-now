const {
    reconciliarCobrosInconsistentes
} = require('../services/reconciliacion.service');

const iniciarWorkerReconciliacion = () => {

    console.log(
        '[WorkerReconciliacion] Iniciado'
    );

    setInterval(async () => {

        try {

            console.log(
                '[WorkerReconciliacion] Ejecutando reconciliación...'
            );

            await reconciliarCobrosInconsistentes();

        } catch (error) {

            console.error(
                '[WorkerReconciliacion] Error:',
                error.message
            );
        }

    }, 30000); // cada 30 segundos
};

module.exports = {
    iniciarWorkerReconciliacion
};