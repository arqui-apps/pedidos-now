const reembolsoService = require('../services/reembolso.service');
const Joi = require('joi');

// Validación
const reembolsoSchema = Joi.object({
    cliente_id: Joi.number().required(),
    pedido_id: Joi.number().required(),
    monto: Joi.number().positive().required(),
    razon: Joi.string().required(),
    tipo: Joi.string().valid('devolucion', 'compensacion').required()
});

const crearReembolso = async (req, res) => {
    try {
        const { error, value } = reembolsoSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                ok: false,
                error: error.details[0].message
            });
        }

        const reembolso = await reembolsoService.crearReembolso(value);
        res.status(201).json(reembolso);

    } catch (error) {
        console.error(error);
        res.status(400).json({
            ok: false,
            error: error.message
        });
    }
};

const obtenerReembolsos = async (req, res) => {
    try {
        const { cliente_id, estado, inicio, fin } = req.query;
        
        const filtros = {};
        if (cliente_id) filtros.cliente_id = cliente_id;
        if (estado) filtros.estado = estado;
        if (inicio && fin) {
            filtros.inicio = inicio;
            filtros.fin = fin;
        }

        const reembolsos = await reembolsoService.obtenerReembolsos(filtros);
        
        res.json({
            ok: true,
            count: reembolsos.length,
            reembolsos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener reembolsos'
        });
    }
};

const obtenerReembolsoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const reembolso = await reembolsoService.obtenerReembolsoPorId(id);
        
        if (!reembolso) {
            return res.status(404).json({
                ok: false,
                error: 'Reembolso no encontrado'
            });
        }

        res.json({
            ok: true,
            reembolso
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener reembolso'
        });
    }
};

const procesarReembolso = async (req, res) => {
    try {
        const { id } = req.params;
        const { medio_pago } = req.body; // 'tarjeta', 'cupon', etc

        if (!medio_pago) {
            return res.status(400).json({
                ok: false,
                error: 'medio_pago requerido'
            });
        }

        const reembolso = await reembolsoService.procesarReembolso(id, medio_pago);
        
        res.json({
            ok: true,
            reembolso
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            ok: false,
            error: error.message
        });
    }
};

const rechazarReembolso = async (req, res) => {
    try {
        const { id } = req.params;
        const { razon } = req.body;

        if (!razon) {
            return res.status(400).json({
                ok: false,
                error: 'razon requerida para rechazar'
            });
        }

        const reembolso = await reembolsoService.rechazarReembolso(id, razon);
        
        res.json({
            ok: true,
            reembolso
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            ok: false,
            error: error.message
        });
    }
};

const obtenerTotalReembolsos = async (req, res) => {
    try {
        const { inicio, fin } = req.query;

        const filtros = {};
        if (inicio && fin) {
            filtros.inicio = inicio;
            filtros.fin = fin;
        }

        const total = await reembolsoService.obtenerTotalReembolsos(filtros);
        
        res.json({
            ok: true,
            total_reembolsos: Number(total.total_reembolsos) || 0,
            monto_total: Number(total.monto_total) || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener total de reembolsos'
        });
    }
};

module.exports = {
    crearReembolso,
    obtenerReembolsos,
    obtenerReembolsoPorId,
    procesarReembolso,
    rechazarReembolso,
    obtenerTotalReembolsos
};