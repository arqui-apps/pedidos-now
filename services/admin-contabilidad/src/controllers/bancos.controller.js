const bancoClient = require('../integrations/banco-client');

const obtenerCuentas = async (req, res, next) => {
    try {
        const associate_id = req.user.id;

        const cuentas = await bancoClient.obtenerCuentasPorAsociado(associate_id);

        res.json({
            ok: true,
            cuentas
        });

    } catch (error) {
        next(error);
    }
};

const consultarSaldo = async (req, res, next) => {
    try {
        const { account_number } = req.params;

        const saldo = await bancoClient.consultarSaldo(account_number);

        res.json({
            ok: true,
            saldo
        });

    } catch (error) {
        next(error);
    }
};

const verificarBanco = async (req, res, next) => {
    try {
        const estado = await bancoClient.verificarDisponibilidad();

        res.json({
            ok: true,
            banco: estado,
            circuit_breaker: bancoClient.getCircuitBreakerStatus(),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerCuentas,
    consultarSaldo,
    verificarBanco
};