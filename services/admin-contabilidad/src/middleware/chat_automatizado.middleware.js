const hasValue = (value) => value !== undefined && value !== null && value !== '';

const validateBody = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El body debe ser un objeto JSON'
        });
    }

    next();
};

const requireAny = (groups) => (req, res, next) => {
    const missing = groups
        .filter((group) => !group.some((field) => hasValue(req.body[field])))
        .map((group) => group.join(' o '));

    if (missing.length) {
        return res.status(400).json({
            ok: false,
            mensaje: `Campos obligatorios faltantes: ${missing.join(', ')}`
        });
    }

    next();
};

const validateSesion = [
    validateBody,
    requireAny([
        ['id_session_externo', 'id_session'],
        ['id_usuario_externo', 'id_usuario'],
        ['user_type']
    ])
];

const validateMensaje = [
    validateBody,
    requireAny([
        ['id_session_externo', 'id_session'],
        ['message_sender']
    ])
];

const validateCompensacion = [
    validateBody,
    requireAny([
        ['compensation_type']
    ])
];

const validateSoporte = [
    validateBody,
    requireAny([
        ['id_session_externo', 'id_session']
    ])
];

const validateConsulta = [
    validateBody,
    requireAny([
        ['id_session_externo', 'id_session'],
        ['inquiry_type'],
        ['input_value']
    ])
];

const validateSync = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El body debe ser un objeto JSON'
        });
    }

    const keys = ['sesiones', 'mensajes', 'compensaciones', 'soporte', 'consultas'];
    const hasAtLeastOneArray = keys.some((key) => Array.isArray(req.body[key]));

    if (!hasAtLeastOneArray) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Debe enviar al menos un arreglo: sesiones, mensajes, compensaciones, soporte o consultas'
        });
    }

    next();
};

const validateClienteParam = (req, res, next) => {
    const idUsuario = Number(req.params.id_usuario);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'id_usuario debe ser un numero entero positivo'
        });
    }

    next();
};

module.exports = {
    validateSesion,
    validateMensaje,
    validateCompensacion,
    validateSoporte,
    validateConsulta,
    validateSync,
    validateClienteParam
};
