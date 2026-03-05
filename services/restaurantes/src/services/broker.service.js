const axios = require('axios');
const { BROKER_SERVICE_URL, endpoints } = require('../config/external-services');

/**
 * Notificar al Broker sobre un nuevo pedido
 */
const notifyNuevoPedido = async (pedidoData) => {
  try {
    const response = await axios.post(
      `${BROKER_SERVICE_URL}${endpoints.broker.notifyPedido}`,
      pedidoData
    );
    return response.data;
  } catch (error) {
    console.error('Error al notificar al Broker:', error.message);
    throw error;
  }
};

module.exports = {
  notifyNuevoPedido
};
