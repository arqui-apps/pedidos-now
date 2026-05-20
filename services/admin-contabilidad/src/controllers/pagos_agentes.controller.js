const pagosService = require('../services/pagos_agentes.service');
const Joi = require('joi');

// Validación
const pagoSchema = Joi.object({
    agente_id: Joi.number().required(),
    salario: Joi.number().positive().required(),
    descripcion: Joi.string().optional()
});

const crearPago = async (req, res) => {
    try {
        const { error, value } = pagoSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                ok: false,
                error: error.details[0].message
            });
        }

        const pago = await pagosService.crearPago(value);
        res.status(201).json(pago);

    } catch (error) {
        console.error(error);
        res.status(400).json({
            ok: false,
            error: error.message
        });
    }
};

const obtenerPagos = async (req, res) => {
    try {
        const { agente_id, inicio, fin } = req.query;
        
        const filtros = {};
        if (agente_id) filtros.agente_id = agente_id;
        if (inicio && fin) {
            filtros.inicio = inicio;
            filtros.fin = fin;
        }

        const pagos = await pagosService.obtenerPagos(filtros);
        
        res.json({
            ok: true,
            count: pagos.length,
            pagos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener pagos'
        });
    }
};

const obtenerPagoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const pago = await pagosService.obtenerPagoPorId(id);
        
        if (!pago) {
            return res.status(404).json({
                ok: false,
                error: 'Pago no encontrado'
            });
        }

        res.json({
            ok: true,
            pago
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener pago'
        });
    }
};

const obtenerTotalPagos = async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        
        const filtros = {};
        if (inicio && fin) {
            filtros.inicio = inicio;
            filtros.fin = fin;
        }

        const total = await pagosService.obtenerTotalPagos(filtros);
        
        res.json({
            ok: true,
            total_pagos: Number(total.total_pagos) || 0,
            monto_total: Number(total.monto_total) || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener total de pagos'
        });
    }
};

const obtenerPagosPorAgente = async (req, res) => {
    try {
        const { agente_id } = req.params;
        const pagos = await pagosService.obtenerPagosPorAgente(agente_id);
        
        res.json({
            ok: true,
            agente_id,
            count: pagos.length,
            pagos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error al obtener pagos del agente'
        });
    }
};

module.exports = {
    crearPago,
    obtenerPagos,
    obtenerPagoPorId,
    obtenerTotalPagos,
    obtenerPagosPorAgente
};