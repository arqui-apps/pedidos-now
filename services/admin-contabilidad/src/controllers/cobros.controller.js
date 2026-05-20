const cobrosService = require('../services/cobros.service');
const Joi = require('joi');

// ========== SCHEMA (AJUSTADO, NO ELIMINADO) ==========

const cobroSchema = Joi.object({
    idempotency_key: Joi.string().required(),
    
    cliente_id: Joi.number()
        .integer()
        .positive()
        .optional(),

    pedido_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'pedido_id debe ser un número',
            'number.positive': 'pedido_id debe ser positivo',
            'any.required': 'pedido_id es requerido'
        }),

    monto_total: Joi.number()
        .positive()
        .max(99999.99)
        .required()
        .custom((value, helpers) => {
            const stringValue = value.toString();
            const parts = stringValue.split('.');
            
            if (parts.length > 1 && parts[1].length > 2) {
                return helpers.error('number.decimals');
            }
            return value;
        })
        .messages({
            'number.base': 'monto_total debe ser un número',
            'number.positive': 'monto_total debe ser mayor a 0',
            'number.max': 'monto_total no puede exceder 99,999.99',
            'number.decimals': 'monto_total debe tener máximo 2 decimales',
            'any.required': 'monto_total es requerido'
        }),

    tarifa_servicio: Joi.number()
        .precision(2)
        .min(0)
        .max(9999.99)
        .optional()
        .custom((value, helpers) => {
            if (value !== undefined) {
                const stringValue = value.toString();
                const parts = stringValue.split('.');
                
                if (parts.length > 1 && parts[1].length > 2) {
                    return helpers.error('number.decimals');
                }
            }
            return value;
        }),

    propina: Joi.number()
        .precision(2)
        .min(0)
        .max(9999.99)
        .optional()
        .custom((value, helpers) => {
            if (value !== undefined) {
                const stringValue = value.toString();
                const parts = stringValue.split('.');
                
                if (parts.length > 1 && parts[1].length > 2) {
                    return helpers.error('number.decimals');
                }
            }
            return value;
        }),

    tipo_pago: Joi.string()
        .valid('efectivo', 'tarjeta', 'cupon')
        .required(),

    card_number: Joi.string()
        .when('tipo_pago', {
            is: 'tarjeta',
            then: Joi.required(),
            otherwise: Joi.optional()
        })
        .messages({
            'any.required': 'card_number es requerido para pagos con tarjeta'
        }),

    cvv: Joi.number()
        .integer()
        .when('tipo_pago', {
            is: 'tarjeta',
            then: Joi.required(),
            otherwise: Joi.optional()
        })
        .messages({
            'any.required': 'cvv es requerido para pagos con tarjeta'
        }),

    repartidor_id: Joi.number()
        .integer()
        .positive()
        .optional(),

    cupon_id: Joi.number()
        .integer()
        .positive()
        .when('tipo_pago', {
            is: 'cupon',
            then: Joi.required(),
            otherwise: Joi.optional()
        })
});

// ========== OBTENER COBROS (CON SEGURIDAD + FILTROS) ==========

const obtenerCobros = async (req, res) => {
    try {
        const { estado, inicio, fin } = req.query;

        const cliente_id = req.user.id;

        const filtros = {
            ...(estado && { estado }),
            ...(inicio && fin && { inicio, fin }),
            cliente_id // 🔐 seguridad agregada
        };

        const cobros = await cobrosService.obtenerCobros(filtros);

        res.json({ ok: true, cobros });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ========== OBTENER COBRO POR ID ==========

const obtenerCobroPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const cobro = await cobrosService.obtenerCobroPorId(id);

        if (!cobro) {
            return res.status(404).json({ error: 'Cobro no encontrado' });
        }

        res.json({ ok: true, cobro });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ========== PROCESAR COBRO (CON JOI + JWT) ==========

const procesarCobro = async (req, res) => {
    try {
        //cliente autenticado
        const cliente_id = req.user.id;

        //VALIDACIÓN JOI (SE MANTIENE)
        const { error, value } = cobroSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                ok: false,
                error: error.details[0].message
            });
        }

        const data = {
            ...value,
            cliente_id
        };

        const result = await cobrosService.procesarCobro(data);

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(400).json({
            ok: false,
            error: error.message
        });
    }
};

// ========== CANCELAR COBRO ==========

const cancelarCobro = async (req, res) => {
    try {
        const { id } = req.params;
        const { razon } = req.body;

        if (!razon) {
            return res.status(400).json({
                error: 'Razón de cancelación requerida'
            });
        }

        const resultado = await cobrosService.cancelarCobro(id, razon);

        res.json({ ok: true, resultado });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ========== COBROS POR REPARTIDOR ==========

const obtenerCobrosPorRepartidor = async (req, res) => {
    try {
        const { repartidor_id } = req.params;

        const cobros = await cobrosService.obtenerCobrosPorRepartidor(repartidor_id);

        res.json({ ok: true, cobros });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ========== SALDO REPARTIDOR ==========

const obtenerSaldoRepartidor = async (req, res) => {
    try {
        const { repartidor_id } = req.params;

        const saldo = await cobrosService.obtenerSaldoRepartidor(repartidor_id);

        res.json({ ok: true, saldo });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ========== ESTADO BANCO ==========

const obtenerEstadoBancario = async (req, res) => {
    try {
        const estado = await cobrosService.obtenerEstadoBancario();

        res.json({ ok: true, estado });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    obtenerCobros,
    obtenerCobroPorId,
    procesarCobro,
    cancelarCobro,
    obtenerCobrosPorRepartidor,
    obtenerSaldoRepartidor,
    obtenerEstadoBancario
};