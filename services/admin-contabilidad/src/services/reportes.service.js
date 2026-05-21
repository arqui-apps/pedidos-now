const axios = require('axios');
const reportesRepo = require('../repositories/reportes.repository');

const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || process.env.BROKER_URL || 'http://localhost:5000';
const USUARIOS_SERVICE_URL = process.env.USUARIOS_SERVICE_URL || 'http://localhost:5001';
const PEDIDOS_SERVICE_URL = process.env.PEDIDOS_SERVICE_URL || 'http://localhost:4000';

const getPagosPorFecha = (inicio, fin) => {
    return reportesRepo.getPagosPorFecha(inicio, fin);
};

const getVentas = (inicio, fin) => {
    return reportesRepo.getVentas(inicio, fin);
};

const getPedidos = (inicio, fin) => {
    return reportesRepo.getPedidos(inicio, fin);
};

const getPropinas = (inicio, fin) => {
    return reportesRepo.getPropinas(inicio, fin);
};

const getCostos = (inicio, fin) => {
    return reportesRepo.getCostos(inicio, fin);
};

const getCrecimiento = async () => {
    const data = await reportesRepo.getCrecimientoVentas();

    const hoy = Number(data.hoy);
    const ayer = Number(data.ayer);

    const crecimiento = data.ayer === 0
        ? 100
        : ((hoy - ayer) / ayer) * 100;

    return {
        hoy,
        ayer,
        crecimiento
    };
};

const fetchServiceData = async (baseUrl, path, fallbackMessage) => {
    try {
        const sanitizedBaseUrl = baseUrl.replace(/\/$/, '');
        const response = await axios.get(`${sanitizedBaseUrl}${path}`);
        return response.data;
    } catch (error) {
        return {
            mensaje: fallbackMessage,
            fallback: true
        };
    }
};

const getChats = async () => {
    return fetchServiceData(CHAT_SERVICE_URL, '/chats', 'Servicio de chats no disponible');
};

const getUsuarios = async () => {
    return fetchServiceData(USUARIOS_SERVICE_URL, '/usuarios', 'Servicio de usuarios no disponible');
};

const getPedidosExternos = async () => {
    return fetchServiceData(PEDIDOS_SERVICE_URL, '/pedidos', 'Servicio externo no disponible');
};

const getEstadisticasPorEntidad = (inicio, fin) => {
    return reportesRepo.getEstadisticasPorEntidad(inicio, fin);
};

const getReembolsosYCompensaciones = (inicio, fin) => {
    return reportesRepo.getReembolsosYCompensaciones(inicio, fin);
};

module.exports = {
    getPagosPorFecha,
    getVentas,
    getPedidos,
    getPropinas,
    getCostos,
    getCrecimiento,
    getChats,
    getUsuarios,
    getPedidosExternos,
    getEstadisticasPorEntidad,
    getReembolsosYCompensaciones
};
