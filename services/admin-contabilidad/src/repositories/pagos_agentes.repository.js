const { sequelize } = require('../config/db');
const movRepo = require('./movimiento.repository');

// ========== CREAR PAGO A AGENTE ==========

const crearPago = async (data, transaction = null) => {
    // Registrar como egreso en movimiento_financiero
    const movimiento = await movRepo.crearEgreso({
        cuenta_id: 1, // Cuenta principal del fondo
        subtipo: 'pago_agente',
        monto: data.salario,  // ← CAMBIO: usar data.salario en lugar de data.monto
        descripcion: data.descripcion || `Pago a agente #${data.agente_id}`,
        referencia_id: data.agente_id,
        modulo_origen: 'admin-contabilidad'
    }, transaction);

    return {
        id: movimiento.id,
        agente_id: data.agente_id,
        monto: data.salario,
        descripcion: data.descripcion,
        estado: movimiento.estado,
        fecha: movimiento.fecha
    };
};

// ========== OBTENER PAGOS ==========

const obtenerPagos = async (filtros = {}, transaction = null) => {
    let query = `SELECT 
        id, 
        referencia_id as agente_id,
        monto,
        descripcion,
        estado,
        fecha
    FROM movimiento_financiero
    WHERE tipo = 'egreso' 
    AND subtipo = 'pago_agente'`;
    
    const replacements = {};

    if (filtros.agente_id) {
        query += ` AND referencia_id = :agente_id`;
        replacements.agente_id = filtros.agente_id;
    }

    if (filtros.inicio && filtros.fin) {
        query += ` AND DATE(fecha) BETWEEN :inicio AND :fin`;
        replacements.inicio = filtros.inicio;
        replacements.fin = filtros.fin;
    }

    query += ` ORDER BY fecha DESC`;

    return await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
        transaction
    });
};

// ========== OBTENER PAGO POR ID ==========

const obtenerPagoPorId = async (id, transaction = null) => {
    const result = await sequelize.query(
        `SELECT 
            id,
            referencia_id as agente_id,
            monto,
            descripcion,
            estado,
            fecha
        FROM movimiento_financiero
        WHERE id = :id
        AND tipo = 'egreso'
        AND subtipo = 'pago_agente'`,
        {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT,
            transaction
        }
    );
    return result[0];
};

// ========== OBTENER TOTAL PAGOS ==========

const obtenerTotalPagos = async (filtros = {}, transaction = null) => {
    let query = `SELECT 
        COUNT(*) as total_pagos,
        SUM(monto) as monto_total
    FROM movimiento_financiero
    WHERE tipo = 'egreso'
    AND subtipo = 'pago_agente'`;

    const replacements = {};

    if (filtros.inicio && filtros.fin) {
        query += ` AND DATE(fecha) BETWEEN :inicio AND :fin`;
        replacements.inicio = filtros.inicio;
        replacements.fin = filtros.fin;
    }

    const result = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
        transaction
    });
    return result[0];
};

// ========== OBTENER PAGOS POR AGENTE ==========

const obtenerPagosPorAgente = async (agente_id, transaction = null) => {
    return await sequelize.query(
        `SELECT 
            id,
            referencia_id as agente_id,
            monto,
            descripcion,
            estado,
            fecha
        FROM movimiento_financiero
        WHERE tipo = 'egreso'
        AND subtipo = 'pago_agente'
        AND referencia_id = :agente_id
        ORDER BY fecha DESC`,
        {
            replacements: { agente_id },
            type: sequelize.QueryTypes.SELECT,
            transaction
        }
    );
};

module.exports = {
    crearPago,
    obtenerPagos,
    obtenerPagoPorId,
    obtenerTotalPagos,
    obtenerPagosPorAgente
};