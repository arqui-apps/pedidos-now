// Admin-contabilidad Victor

const validarMonto = (req, res, next) => {
    const monto = req.body.monto ?? req.body.monto_total;

    if (monto === undefined || monto === null) {
        return res.status(400).json({
            ok: false,
            error: 'El monto es requerido. Use monto o monto_total.'
        });
    }

    const montoNumerico = Number(monto);

    if (Number.isNaN(montoNumerico) || montoNumerico <= 0) {
        return res.status(400).json({
            ok: false,
            error: 'Monto inválido. Debe ser un número mayor a 0.'
        });
    }

    req.body.monto = montoNumerico;

    next();
};

const validarIdempotencyKey = (req, res, next) => {
    const { idempotency_key } = req.body;

    if (!idempotency_key) {
        return res.status(400).json({
            ok: false,
            error: 'idempotency_key es requerida'
        });
    }

    next();
};

module.exports = {
    validarMonto,
    validarIdempotencyKey
};