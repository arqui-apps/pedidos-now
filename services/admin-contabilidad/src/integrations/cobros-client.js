const axios = require('axios');
const { toCobrosAPI } = require('./mappers/cobros.mapper');
const COBROS_SERVICE_URL = process.env.COBROS_SERVICE_URL || 'http://localhost:3005/api';

let cobrosCaller;

try {
    cobrosCaller = axios.create({
        baseURL: COBROS_SERVICE_URL,
        timeout: 20000
    });

    cobrosCaller.interceptors.request.use(config => {
        if (global.currentToken) {
            config.headers.Authorization = `Bearer ${global.currentToken}`;
        }
        return config;
    });
} catch (error) {
    console.warn('Cobros client no disponible en tests');
}

// ========== COBROS ==========

const procesarCobro = async (data) => {
    try {

        const payload = toCobrosAPI(data);

        console.log(
            '[CobrosClient] Payload transformado correctamente'
        );

        const response =
        await cobrosCaller.post(
            '/payments',
            payload
        );

        return response.data;

    } catch (error) {

        console.error(
            '[CobrosClient] ERROR COMPLETO:',
            {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
                message: error.message,
                code: error.code,
                stack: error.stack
            }
        );
            throw new Error(
                JSON.stringify(
                error.response?.data || {
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                }
            )
        );
    }
};

const obtenerCobros = async (filtros = {}) => {
    try {
        const response = await cobrosCaller.get('/payments', { params: filtros });
        return response.data;
    } catch (error) {
        throw new Error(`Error obteniendo cobros: ${error.message}`);
    }
};

const obtenerCobroPorId = async (id) => {
    try {
        const response = await cobrosCaller.get(`/payments/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(`Error obteniendo cobro: ${error.message}`);
    }
};

const cancelarCobro = async (id, motivo) => {
    try {
        const response = await cobrosCaller.post(
            `/payments/${id}/cancel`,
            { motivo }
        );
        return response.data;
    } catch (error) {
        throw new Error(`Error cancelando cobro: ${error.message}`);
    }
};

const registrarDevolucion = async (data) => {
    try {
        const response = await cobrosCaller.post('/devoluciones', data);
        return response.data;
        } catch (error) {
        console.error(
            '[CobrosClient] Error devolucion:',
            {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            }
        );

        throw new Error(
            `Error registrando devolución: ${error.message}`
        );
    }
};

module.exports = {
    procesarCobro,
    obtenerCobros,
    obtenerCobroPorId,
    cancelarCobro,
    registrarDevolucion
};