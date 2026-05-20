const { sequelize } = require('../config/db');

// ========== CREAR REEMBOLSO ==========

const crearReembolso = async (data, transaction = null) => {
    const result = await sequelize.query(
        `INSERT INTO movimiento_financiero 
        (cuenta_id, tipo, subtipo, monto, descripcion, referencia_id, modulo_origen, pedido_id, estado)
        VALUES (:cuenta_id, :tipo, :subtipo, :monto, :descripcion, :referencia_id, :modulo_origen, :pedido_id, :estado)
        RETURNING *`,
        {
            replacements: {
                cuenta_id: 1, // Cuenta principal del fondo
                tipo: 'egreso',
                subtipo: 'reembolso',
                monto: data.monto,
                descripcion: data.razon || null,
                referencia_id: data.cliente_id,
                modulo_origen: 'admin-contabilidad',
                pedido_id: data.pedido_id || null,
                estado: 'pendiente'
            },
            type: sequelize.QueryTypes.INSERT,
            transaction
        }
    );
    return result[0][0];
};

// ========== OBTENER REEMBOLSOS ==========

const obtenerReembolsos = async (filtros = {}, transaction = null) => {
    let query = `SELECT * FROM movimiento_financiero 
                WHERE tipo = 'egreso' AND subtipo = 'reembolso'`;
    const replacements = {};

    if (filtros.cliente_id) {
        query += ` AND referencia_id = :cliente_id`;
        replacements.cliente_id = filtros.cliente_id;
    }

    if (filtros.estado) {
        query += ` AND estado = :estado`;
        replacements.estado = filtros.estado;
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

// ========== OBTENER REEMBOLSO POR ID ==========

const obtenerReembolsoPorId = async (id, transaction = null) => {
    const result = await sequelize.query(
        `SELECT * FROM movimiento_financiero 
        WHERE id = :id AND tipo = 'egreso' AND subtipo = 'reembolso'`,
        {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT,
            transaction
        }
    );
    return result[0];
};

// ========== ACTUALIZAR ESTADO ==========

const actualizarEstado = async (id, estado, transaction = null) => {
    const result = await sequelize.query(
        `UPDATE movimiento_financiero 
        SET estado = :estado 
        WHERE id = :id 
        RETURNING *`,
        {
            replacements: { id, estado },
            type: sequelize.QueryTypes.UPDATE,
            transaction
        }
    );
    return result[0][0];
};

// ========== OBTENER TOTAL REEMBOLSOS ==========

const obtenerTotalReembolsos = async (filtros = {}, transaction = null) => {
    let query = `SELECT 
                    COUNT(*) as total_reembolsos,
                    SUM(monto) as monto_total
                FROM movimiento_financiero
                WHERE tipo = 'egreso' AND subtipo = 'reembolso'`;
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

module.exports = {
    crearReembolso,
    obtenerReembolsos,
    obtenerReembolsoPorId,
    actualizarEstado,
    obtenerTotalReembolsos
};