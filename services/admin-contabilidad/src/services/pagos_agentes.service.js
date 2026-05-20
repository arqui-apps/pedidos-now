const pagosRepo = require('../repositories/pagos_agentes.repository');
const movRepo = require('../repositories/movimiento.repository');
const { sequelize } = require('../config/db');

// ========== CREAR PAGO ==========

const crearPago = async (data) => {
    const transaction = await sequelize.transaction();

    try {
        if (!data.agente_id || !data.salario) {
            throw new Error('agente_id y salario son requeridos');
        }

        if (data.salario <= 0) {
            throw new Error('Salario debe ser mayor a 0');
        }

        // Verificar fondos disponibles
        const saldoAnterior = await movRepo.obtenerSaldoActual(1, transaction);

        if (saldoAnterior < data.salario) {
            throw new Error('Fondos insuficientes para pagar');
        }

        // Crear pago (registra como egreso en movimiento_financiero)
        const pago = await pagosRepo.crearPago(data, transaction);

        await transaction.commit();

        return {
            ok: true,
            pago
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ========== OBTENER PAGOS ==========

const obtenerPagos = async (filtros = {}) => {
    return await pagosRepo.obtenerPagos(filtros);
};

// ========== OBTENER PAGO POR ID ==========

const obtenerPagoPorId = async (id) => {
    return await pagosRepo.obtenerPagoPorId(id);
};

// ========== OBTENER TOTAL PAGOS ==========

const obtenerTotalPagos = async (filtros = {}) => {
    return await pagosRepo.obtenerTotalPagos(filtros);
};

// ========== OBTENER PAGOS POR AGENTE ==========

const obtenerPagosPorAgente = async (agente_id) => {
    return await pagosRepo.obtenerPagosPorAgente(agente_id);
};

module.exports = {
    crearPago,
    obtenerPagos,
    obtenerPagoPorId,
    obtenerTotalPagos,
    obtenerPagosPorAgente
};