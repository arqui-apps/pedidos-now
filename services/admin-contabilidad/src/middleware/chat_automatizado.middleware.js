const hasValue = (value) => value !== undefined && value !== null && value !== '';

const enumValues = {
    user_type: ['cliente', 'repartidor', 'negocio'],
    session_status: ['active', 'inactive', 'expired'],
    resolution: [
        'resuelto',
        'resuelto_con_cupon',
        'resuelto_con_reembolso',
        'escalado_a_agente',
        'cerrado_sin_resolver'
    ],
    compensation_type: ['cupon', 'reembolso'],
    compensation_status: ['pendiente', 'procesado', 'usado', 'expirado', 'rechazado'],
    request_status: ['pendiente', 'en_proceso', 'resuelto', 'cancelado'],
    inquiry_type: ['pedido', 'cliente', 'repartidor']
};

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

const validateAllowedValues = (fields) => (req, res, next) => {
    for (const field of fields) {
        const value = req.body[field];

        if (!hasValue(value)) {
            continue;
        }

        if (!enumValues[field].includes(value)) {
            return res.status(400).json({
                ok: false,
                mensaje: `El campo ${field} debe ser uno de: ${enumValues[field].join(', ')}`
            });
        }
    }

    next();
};

const validateSesion = [
    validateBody,
    requireAny([
        ['id_session_externo', 'id_session'],
        ['id_usuario_externo', 'id_usuario'],
        ['user_type']
    ]),
    validateAllowedValues(['user_type', 'session_status', 'resolution'])
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
    ]),
    validateAllowedValues(['compensation_type', 'compensation_status'])
];

const validateSoporte = [
    validateBody,
    requireAny([
        ['id_session_externo', 'id_session']
    ]),
    validateAllowedValues(['request_status'])
];

const validateConsulta = [
    validateBody,
    requireAny([
        ['id_session_externo', 'id_session'],
        ['inquiry_type'],
        ['input_value']
    ]),
    validateAllowedValues(['inquiry_type'])
];

const validateSync = (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El body debe ser un objeto JSON'
        });
    }

    const keys = ['sesiones', 'mensajes', 'compensaciones', 'soporte', 'consultas'];
    const invalidKeys = keys.filter((key) => req.body[key] !== undefined && !Array.isArray(req.body[key]));

    if (invalidKeys.length) {
        return res.status(400).json({
            ok: false,
            mensaje: `Los campos ${invalidKeys.join(', ')} deben ser arreglos`
        });
    }

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
