const axios = require('axios');

const BROKER_URL = process.env.BROKER_URL || 'http://localhost:5000';

const brokerCaller = axios.create({
    baseURL: BROKER_URL,
    timeout: 5000
});

// Interceptor para agregar token
brokerCaller.interceptors.request.use(config => {
    if (global.currentToken) {
        config.headers.Authorization = `Bearer ${global.currentToken}`;
    }
    return config;
});

// ========== COMUNICACIÓN CON BROKER ==========

const enviarPeticion = async (ruta, metodo = 'post', data = {}) => {
    try {
        const response = await brokerCaller({
            method: metodo,
            url: ruta,
            data
        });
        return response.data;
    } catch (error) {
        throw new Error(`Error comunicando con broker: ${error.message}`);
    }
};

const procesarCobroPorBroker = async (data) => {
    try {
        const response = await brokerCaller.post('/cobros', data);
        return response.data;
    } catch (error) {
        throw new Error(`Error procesando cobro por broker: ${error.message}`);
    }
};

const solicitarTransferencia = async (data) => {
    try {
        const response = await brokerCaller.post('/transferencias', data);
        return response.data;
    } catch (error) {
        throw new Error(`Error solicitando transferencia: ${error.message}`);
    }
};

const solicitarReembolso = async (data) => {
    try {
        const response = await brokerCaller.post('/reembolsos', data);
        return response.data;
    } catch (error) {
        throw new Error(`Error solicitando reembolso: ${error.message}`);
    }
};

module.exports = {
    enviarPeticion,
    procesarCobroPorBroker,
    solicitarTransferencia,
    solicitarReembolso
};