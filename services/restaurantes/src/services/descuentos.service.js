const axios = require('axios');
const { DESCUENTOS_SERVICE_URL, endpoints } = require('../config/external-services');

/**
 * Obtener promociones disponibles
 */
const getPromociones = async (restauranteId, params = {}) => {
  try {
    const response = await axios.get(
      `${DESCUENTOS_SERVICE_URL}${endpoints.descuentos.getPromociones}`,
      {
        params: { restauranteId, ...params }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener promociones:', error.message);
    return [];
  }
};

/**
 * Validar un código de descuento
 */
const validateDescuento = async (codigoDescuento, pedidoData) => {
  try {
    const response = await axios.post(
      `${DESCUENTOS_SERVICE_URL}${endpoints.descuentos.validateDescuento}`,
      { codigo: codigoDescuento, pedido: pedidoData }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Descuento no válido');
  }
};

module.exports = {
  getPromociones,
  validateDescuento
};
