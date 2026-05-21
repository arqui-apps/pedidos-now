const axios = require('axios');
const { AUTH_SERVICE_URL, endpoints } = require('../config/external-services');

/**
 * Validar token de autenticación con el servicio de Auth
 */
const validateToken = async (token) => {
  try {
    const response = await axios.post(
      `${AUTH_SERVICE_URL}${endpoints.auth.validate}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al validar token');
  }
};

module.exports = {
  validateToken
};
