// Admin-contabilidad Victor

const axios = require('axios');

const NEGOCIOS_SERVICE_URL = process.env.NEGOCIOS_SERVICE_URL || 'https://proyectoarqui.onrender.com/api';

const http = axios.create({
    baseURL: NEGOCIOS_SERVICE_URL,
    timeout: 60000,
    headers: {
        Accept: 'application/json'
    }
});

const verificarSaludNegocios = async () => {
    const response = await http.get('/health');
    return response.data;
};

const listarNegocios = async (query = {}) => {
    const response = await http.get('/businesses', {
        params: query
    });

    return response.data;
};

const obtenerNegocioPorId = async (businessId) => {
    const response = await http.get(`/businesses/${businessId}`);
    return response.data;
};

const obtenerCatalogoNegocio = async (businessId) => {
    const response = await http.get(`/businesses/${businessId}/catalog`);
    return response.data;
};

const obtenerProductosNegocio = async (businessId, query = {}) => {
    const response = await http.get(`/businesses/${businessId}/products`, {
        params: query
    });

    return response.data;
};

const obtenerInventarioNegocio = async (businessId) => {
    const response = await http.get(`/businesses/${businessId}/inventory`);
    return response.data;
};

const obtenerStockProducto = async (businessId, productId) => {
    const response = await http.get(`/businesses/${businessId}/inventory/products/${productId}`);
    return response.data;
};

module.exports = {
    verificarSaludNegocios,
    listarNegocios,
    obtenerNegocioPorId,
    obtenerCatalogoNegocio,
    obtenerProductosNegocio,
    obtenerInventarioNegocio,
    obtenerStockProducto
};