const axios = require('axios');
const { COBROS_SERVICE_URL, endpoints } = require('../config/external-services');

/**
 * Aplicar una multa por cancelación de pedido
 */
const aplicarMulta = async (multaData) => {
  try {
    const response = await axios.post(
      `${COBROS_SERVICE_URL}${endpoints.cobros.aplicarMulta}`,
      multaData
    );
    return response.data;
  } catch (error) {
    console.error('Error al aplicar multa:', error.message);
    throw error;
  }
};

/**
 * Procesar un cobro
 */
const procesarCobro = async (cobroData) => {
  try {
    const response = await axios.post(
      `${COBROS_SERVICE_URL}${endpoints.cobros.procesarCobro}`,
      cobroData
    );
    return response.data;
  } catch (error) {
    console.error('Error al procesar cobro:', error.message);
    throw error;
  }
};

module.exports = {
  aplicarMulta,
  procesarCobro
};
