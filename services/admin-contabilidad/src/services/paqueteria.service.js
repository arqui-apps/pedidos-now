// Admin-contabilidad Kenneth

const axios = require('axios');

const PAQUETERIA_SERVICE_URL = process.env.PAQUETERIA_SERVICE_URL || 'http://localhost:3000/api';

const http = axios.create({
  baseURL: PAQUETERIA_SERVICE_URL,
  timeout: 60000,
  headers: {
    Accept: 'application/json'
  }
});

const verificarSaludPaqueteria = async () => {
  const response = await http.get('/shipments');
  return {
    status: 'ok',
    service: 'paqueteria',
    baseUrl: PAQUETERIA_SERVICE_URL,
    data: response.data
  };
};

const listarEnvios = async (query = {}) => {
  const response = await http.get('/shipments', {
    params: query
  });

  return response.data;
};

const obtenerEnvioPorId = async (shipmentId) => {
  const response = await http.get(`/shipments/${shipmentId}`);
  return response.data;
};

const listarPaquetes = async (query = {}) => {
  const response = await http.get('/packages', {
    params: query
  });

  return response.data;
};

const obtenerPaquetePorId = async (packageId) => {
  const response = await http.get(`/packages/${packageId}`);
  return response.data;
};

const listarRepartidores = async (query = {}) => {
  const response = await http.get('/couriers', {
    params: query
  });

  return response.data;
};

const listarRepartidoresDisponibles = async () => {
  const response = await http.get('/couriers/available');
  return response.data;
};

const listarPrecios = async (query = {}) => {
  const response = await http.get('/prices', {
    params: query
  });

  return response.data;
};

const cotizarPaquete = async (data) => {
  const response = await http.post('/packages/quote', data);
  return response.data;
};

const obtenerTrackingPaquete = async (packageId, customerToken = null) => {
  const config = {};

  if (customerToken) {
    config.headers = {
      'x-customer-token': customerToken
    };
  }

  const response = await http.get(`/packages/${packageId}/tracking`, config);
  return response.data;
};

module.exports = {
  verificarSaludPaqueteria,
  listarEnvios,
  obtenerEnvioPorId,
  listarPaquetes,
  obtenerPaquetePorId,
  listarRepartidores,
  listarRepartidoresDisponibles,
  listarPrecios,
  cotizarPaquete,
  obtenerTrackingPaquete
};